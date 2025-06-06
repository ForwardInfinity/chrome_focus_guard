// Popup logic for toolbar action (COMP-UI-POPUP)

declare const chrome: any;

const enabledToggle = document.getElementById('enabled-toggle') as HTMLInputElement;
const enabledLabel = document.getElementById('enabled-label') as HTMLSpanElement;
const pauseBtn = document.getElementById('pause-btn') as HTMLButtonElement;
const pauseStatus = document.getElementById('pause-status') as HTMLSpanElement;
const optionsLink = document.getElementById('options-link') as HTMLAnchorElement;

function getNow(): number {
  return Date.now();
}

function msToMinutes(ms: number): number {
  return Math.ceil(ms / 60000);
}

function updatePauseStatus(pausedUntil: number | null) {
  if (pausedUntil && pausedUntil > getNow()) {
    const mins = msToMinutes(pausedUntil - getNow());
    pauseStatus.textContent = `Paused for ${mins} min${mins > 1 ? 's' : ''}`;
    pauseStatus.hidden = false;
    pauseBtn.disabled = true;
  } else {
    pauseStatus.hidden = true;
    pauseBtn.disabled = false;
  }
}

function refreshUI() {
  chrome.storage.sync.get(['enabled', 'pausedUntil'], (data: any) => {
    const enabled = data.enabled !== false; // default true
    const pausedUntil = typeof data.pausedUntil === 'number' ? data.pausedUntil : null;

    enabledToggle.checked = enabled;
    enabledLabel.textContent = enabled ? 'Enabled' : 'Disabled';
    enabledLabel.style.color = enabled ? '#2e7d32' : '#b71c1c';

    updatePauseStatus(pausedUntil);
  });
}

enabledToggle.addEventListener('change', () => {
  const enabled = enabledToggle.checked;
  chrome.storage.sync.set({ enabled }, refreshUI);
});

pauseBtn.addEventListener('click', () => {
  const pausedUntil = getNow() + 30 * 60 * 1000; // 30 minutes
  chrome.storage.sync.set({ pausedUntil }, refreshUI);
});

optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open('options.html');
  }
});

// Poll every 10s to update pause status if popup stays open
const pollInterval = setInterval(refreshUI, 10000);

window.addEventListener('DOMContentLoaded', refreshUI);
window.addEventListener('unload', () => clearInterval(pollInterval));
