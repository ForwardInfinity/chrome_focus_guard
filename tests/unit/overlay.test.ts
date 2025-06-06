/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/dom";

// Mock chrome.runtime.getURL and sendMessage
(globalThis as any).chrome = {
  runtime: {
    getURL: (path: string) => `/mock-extension/${path}`,
    sendMessage: jest.fn(),
  },
};


// Helper to set up DOM
function setupDOM(targetParam = "https%3A%2F%2Ffacebook.com") {
  document.body.innerHTML = `
    <div id="overlay-backdrop" class="overlay-backdrop" tabindex="-1" aria-modal="true" role="dialog">
      <main class="overlay-content" role="main">
        <video
          id="motivational-video"
          class="overlay-video"
          preload="auto"
          playsinline
          tabindex="0"
          aria-label="Motivational video"
          muted
          autoplay
          disablepictureinpicture
          controlslist="nodownload nofullscreen noremoteplayback"
        ></video>
        <div class="overlay-actions">
          <button
            id="proceed-btn"
            class="overlay-btn"
            type="button"
            disabled
            aria-disabled="true"
          >
            Proceed
          </button>
          <button
            id="back-btn"
            class="overlay-btn"
            type="button"
            disabled
            aria-disabled="true"
          >
            Go Back
          </button>
        </div>
      </main>
    </div>
  `;
  // Simulate query param
  window.history.pushState({}, "", `?target=${targetParam}`);
}

describe("Overlay UI", () => {
  beforeEach(() => {
    jest.resetModules();
    setupDOM();
  });

  it("buttons are initially disabled", async () => {
    require("../../src/content/overlay.ts");
    const proceedBtn = document.getElementById("proceed-btn") as HTMLButtonElement;
    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    expect(proceedBtn).toBeDisabled();
    expect(backBtn).toBeDisabled();
    expect(proceedBtn).toHaveAttribute("aria-disabled", "true");
    expect(backBtn).toHaveAttribute("aria-disabled", "true");
  });

  it("buttons become enabled after video ends", async () => {
    require("../../src/content/overlay.ts");
    const proceedBtn = document.getElementById("proceed-btn") as HTMLButtonElement;
    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    const video = document.getElementById("motivational-video") as HTMLVideoElement;

    // Simulate video end
    fireEvent(video, new Event("ended"));

    expect(proceedBtn).not.toBeDisabled();
    expect(backBtn).not.toBeDisabled();
    expect(proceedBtn).toHaveAttribute("aria-disabled", "false");
    expect(backBtn).toHaveAttribute("aria-disabled", "false");
  });

  it("proceed button label includes domain", async () => {
    require("../../src/content/overlay.ts");
    const proceedBtn = document.getElementById("proceed-btn") as HTMLButtonElement;
    expect(proceedBtn.textContent).toMatch(/facebook\.com/);
  });

  it("proceed button sends message to background", async () => {
    require("../../src/content/overlay.ts");
    const proceedBtn = document.getElementById("proceed-btn") as HTMLButtonElement;
    const video = document.getElementById("motivational-video") as HTMLVideoElement;

    // Enable buttons
    fireEvent(video, new Event("ended"));

    // Click proceed
    fireEvent.click(proceedBtn);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ action: "proceed", url: "https://facebook.com" }),
      expect.any(Function)
    );
  });

  it("back button calls history.back", async () => {
    require("../../src/content/overlay.ts");
    const backBtn = document.getElementById("back-btn") as HTMLButtonElement;
    const video = document.getElementById("motivational-video") as HTMLVideoElement;

    // Enable buttons
    fireEvent(video, new Event("ended"));

    // Spy on history.back
    const backSpy = jest.spyOn(window.history, "back").mockImplementation(() => {});

    // Click back
    fireEvent.click(backBtn);

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
