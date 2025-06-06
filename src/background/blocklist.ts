// Service for CRUD operations on blocklist stored in chrome.storage.sync

declare const chrome: any;

const BLOCKLIST_KEY = 'blocklist';

/**
 * Retrieves the current blocklist from chrome.storage.sync.
 * @returns Promise resolving to an array of blocklisted domains.
 */
export async function getBlocklist(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(BLOCKLIST_KEY, (result: { [key: string]: any }) => {
      const list = result[BLOCKLIST_KEY] as string[] | undefined;
      resolve(Array.isArray(list) ? list : []);
    });
  });
}

/**
 * Adds a domain to the blocklist if not already present.
 * @param domain Domain string to add.
 */
export async function addToBlocklist(domain: string): Promise<void> {
  const list = await getBlocklist();
  if (!list.includes(domain)) {
    const newList = [...list, domain];
    await new Promise<void>((resolve) => {
      chrome.storage.sync.set({ [BLOCKLIST_KEY]: newList }, () => resolve());
    });
  }
}

/**
 * Removes a domain from the blocklist.
 * @param domain Domain string to remove.
 */
export async function removeFromBlocklist(domain: string): Promise<void> {
  const list = await getBlocklist();
  const newList = list.filter((d) => d !== domain);
  await new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [BLOCKLIST_KEY]: newList }, () => resolve());
  });
}

/**
 * Clears the entire blocklist.
 */
export async function clearBlocklist(): Promise<void> {
  await new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [BLOCKLIST_KEY]: [] }, () => resolve());
  });
}
