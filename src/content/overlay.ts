// Overlay logic for motivational video (COMP-CT)

const VIDEO_ASSETS = [
  chrome.runtime.getURL("assets/videos/goggins1.mp4"),
  chrome.runtime.getURL("assets/videos/goggins2.mp4"),
];

// Parse the "target" param from the query string
function getTargetUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const target = params.get("target");
  if (!target) return null;
  try {
    return decodeURIComponent(target);
  } catch {
    return null;
  }
}

// Extract domain for button labels
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Select a random video asset
function pickRandomVideo(): string {
  return VIDEO_ASSETS[Math.floor(Math.random() * VIDEO_ASSETS.length)];
}

// DOM elements
const video = document.getElementById("motivational-video") as HTMLVideoElement;
const proceedBtn = document.getElementById("proceed-btn") as HTMLButtonElement;
const backBtn = document.getElementById("back-btn") as HTMLButtonElement;

const targetUrl = getTargetUrl();
const targetDomain = targetUrl ? getDomain(targetUrl) : "site";

// Set button labels with domain
proceedBtn.textContent = `Proceed to ${targetDomain}`;
backBtn.textContent = "Go Back";

// Set video source
const videoSrc = pickRandomVideo();
const source = document.createElement("source");
source.src = videoSrc;
source.type = "video/mp4";
video.appendChild(source);

// Chrome autoplay policy: play muted, unmute on gesture fallback
video.muted = true;
video.autoplay = true;
video.playsInline = true;
video.controls = false;

// Try to play video (required for Chrome policies)
video.addEventListener("canplay", () => {
  video.play().catch(() => {
    // If autoplay fails, wait for user gesture to unmute/play
  });
});

// Enable buttons only after video ends
video.addEventListener("ended", () => {
  proceedBtn.disabled = false;
  proceedBtn.setAttribute("aria-disabled", "false");
  backBtn.disabled = false;
  backBtn.setAttribute("aria-disabled", "false");
  proceedBtn.focus();
});

// “Proceed” button: send message to background to allow navigation
proceedBtn.addEventListener("click", () => {
  if (!targetUrl) return;
  chrome.runtime.sendMessage({ action: "proceed", url: targetUrl }, () => {
    // The background script should handle navigation
  });
});

// “Go Back” button: navigate back in history
backBtn.addEventListener("click", () => {
  window.history.back();
});

// Accessibility: focus trap inside overlay
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    const focusable = [proceedBtn, backBtn].filter(
      (el) => !el.disabled
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

// On load, ensure both buttons are disabled
proceedBtn.disabled = true;
proceedBtn.setAttribute("aria-disabled", "true");
backBtn.disabled = true;
backBtn.setAttribute("aria-disabled", "true");
