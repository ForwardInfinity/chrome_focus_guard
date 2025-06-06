import { getBlocklist } from './blocklist';

declare const chrome: any;

/**
 * Checks if a given URL's hostname matches any domain in the blocklist.
 */
function isDomainBlocked(url: string, blocklist: string[]): boolean {
  try {
    const { hostname } = new URL(url);
    return blocklist.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Intercept outgoing web requests and redirect blocked domains to the overlay.
 */
chrome.webRequest.onBeforeRequest.addListener(
  async (details: any) => {
    const startTime = Date.now();
    try {
      const blocklist = await getBlocklist();
      if (isDomainBlocked(details.url, blocklist)) {
        const overlayUrl = chrome.runtime.getURL(
          `content/overlay.html?target=${encodeURIComponent(details.url)}`
        );
        return { redirectUrl: overlayUrl };
      }
    } catch (err) {
      if (chrome.runtime.lastError) {
        console.error('Background error:', chrome.runtime.lastError);
      } else {
        console.error('Error in onBeforeRequest listener:', err);
      }
    } finally {
      const latency = Date.now() - startTime;
      if (latency > 50) {
        console.warn(
          `Background intercept latency ${latency}ms for URL: ${details.url}`
        );
      }
    }
    return {};
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

/**
 * Listen for messages from overlay or content scripts to perform navigation actions.
 */
chrome.runtime.onMessage.addListener(
  (message: any, sender: any, sendResponse: Function) => {
    if (!sender.tab || typeof sender.tab.id !== 'number') {
      return;
    }
    const tabId = sender.tab.id;

    if (message?.type === 'proceed' && message.url) {
      chrome.tabs.update(tabId, { url: message.url });
      sendResponse({ success: true });
    } else if (message?.type === 'goBack') {
      // Use tabs.goBack if available, else fallback to injecting history.back()
      if (chrome.tabs.goBack) {
        chrome.tabs.goBack(tabId);
      } else {
        chrome.tabs.executeScript(tabId, {
          code: 'history.back();'
        });
      }
      sendResponse({ success: true });
    }
    // Indicate async response if needed
    return true;
  }
);
