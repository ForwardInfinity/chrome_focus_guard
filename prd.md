## 1. Introduction / Overview — `INTRO-01`

This Chrome Extension prevents unconscious, addictive browsing by intercepting navigation to user-defined distracting websites and presenting a mandatory motivational video overlay before the user can proceed or return.

---

## 2. Product Goals / Objectives

| ID       | Objective                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| `OBJ-01` | Reduce time spent on distracting websites by introducing a deliberate pause and motivational cue.          |
| `OBJ-02` | Offer users effortless control over their personal blocklist.                                              |
| `OBJ-03` | Ensure the intervention is unavoidable yet non-intrusive, respecting user privacy and browser performance. |
| `OBJ-04` | Operate entirely offline once installed, with no external backend dependencies.                            |

---

## 3. Target Audience — `TA-01`

Knowledge workers, students, and anyone seeking to improve focus and productivity by curbing habitual visits to social media or other time-sinking sites.

---

## 4. User Flow / User Journey — `UF-MAIN`

After installing the extension, the user opens the options page where they are greeted by a succinct explanation of how the tool works and an input field to add or remove websites from their personal blocklist, which is immediately saved to Chrome’s synchronized storage. As they continue browsing, when they type a URL or click a link that leads to any site on this list, the extension’s background service intercepts the request and seamlessly replaces the page content with a full-window overlay. A motivational video begins playing instantly and silently counts down without controls, ensuring the user watches it in its entirety. Throughout the video, the “Proceed to Site” and “Go Back” buttons remain visible but disabled, providing visual feedback that an intentional decision point is approaching. When the video ends, the buttons become active; if the user chooses to proceed, the extension restores the original request and loads the desired site, whereas selecting “Go Back” returns them to their previous tab history entry, reinforcing mindful browsing. Subsequent visits repeat this flow unless the user edits their blocklist or temporarily disables the extension from the toolbar popup.

---

## 5. Functional Requirements

| ID      | Requirement                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| `FR-01` | Provide an options page to add, edit, and delete domains from a personal blocklist.                                  |
| `FR-02` | Persist blocklist using `chrome.storage.sync` for cross-device consistency.                                          |
| `FR-03` | Intercept navigation requests matching any blocklisted domain via a background service worker (Manifest V3).         |
| `FR-04` | Replace blocked page with a fullscreen overlay containing an embedded, pre-packaged motivational video.              |
| `FR-05` | Auto-play the video without native controls; prevent skipping or seeking.                                            |
| `FR-06` | Disable “Proceed to \[Website]” and “Go Back” buttons until the video finishes.                                      |
| `FR-07` | On “Proceed”, allow navigation to the originally requested URL.                                                      |
| `FR-08` | On “Go Back”, navigate one step back in the tab’s history.                                                           |
| `FR-09` | Provide a toolbar popup to toggle the extension on/off and display current status.                                   |
| `FR-10` | Ship video assets inside the extension package; if multiple videos are included, select randomly on each invocation. |

---

## 6. Non-Functional Requirements

| ID       | Requirement                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| `NFR-01` | Must not add more than 50 ms average latency to page loads when extension is enabled but target site is not blocked. |
| `NFR-02` | Comply with Chrome Web Store privacy policies; no external data collection or tracking.                              |
| `NFR-03` | Maintain <10 MB total extension package size, including video assets.                                                |
| `NFR-04` | Achieve WCAG 2.1 AA contrast and focus-state guidelines for overlay UI.                                              |
| `NFR-05` | Support the three latest stable Chrome versions on Windows, macOS, and Linux.                                        |

---

## 7. UI / UX Requirements

| ID      | Requirement                                                                               |
| ------- | ----------------------------------------------------------------------------------------- |
| `UI-01` | Overlay uses an opaque dark background with centered video element (16:9).                |
| `UI-02` | Buttons styled prominently, with disabled state opacity reduced to 40 %.                  |
| `UI-03` | Button labels dynamically include the target domain (e.g., “Proceed to facebook.com”).    |
| `UI-04` | Options page follows Material-like layout with domain chip list and add-domain dialog.    |
| `UI-05` | Toolbar popup shows on/off toggle, link to options, and quick “Pause for 30 min” feature. |

---

## 8. System Architecture

| ID                | Component                 | Responsibility                                                                             |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `COMP-BG`         | Background Service Worker | Listens for `webRequest` events, matches URLs against blocklist, and redirects to overlay. |
| `COMP-CT`         | Content Script            | Injected into blocked tab to render overlay HTML/CSS/JS and manage video playback states.  |
| `COMP-UI-OPTIONS` | Options Page              | CRUD interface for blocklist management.                                                   |
| `COMP-UI-POPUP`   | Browser Action Popup      | Quick enable/disable toggle and status display.                                            |
| `COMP-STORAGE`    | Chrome Storage Sync       | Persists settings and blocklist.                                                           |
| `COMP-ASSETS`     | Local Assets              | Bundled MP4/WEBM videos and static images.                                                 |

Data Flow
User navigation → `COMP-BG` URL check → Redirect → `COMP-CT` overlay → User choice → Action routed back to tab (`COMP-BG`) → Normal browsing resumes.

---

## 9. Tech Stack

| ID      | Layer         | Technology                                                  |
| ------- | ------------- | ----------------------------------------------------------- |
| `TS-01` | UI            | Vanilla JS + CSS Modules (no framework to minimize bundle)  |
| `TS-02` | Build         | Vite with `webextension-vite` plugin for Manifest V3 output |
| `TS-03` | Transpilation | TypeScript targeting ES2022                                 |
| `TS-04` | Lint/Format   | ESLint + Prettier                                           |
| `TS-05` | Testing       | Jest + jsdom for unit tests                                 |

\[ASSUMPTION]: A lightweight stack without React is chosen to keep bundle and runtime overhead minimal.

---

## 10. Project Directory Structure

```text
chrome-focus-guard/
├─ src/
│  ├─ background/
│  │  └─ index.ts                # COMP-BG
│  ├─ content/
│  │  ├─ overlay.html            # COMP-CT HTML
│  │  ├─ overlay.ts              # overlay logic
│  │  └─ overlay.css
│  ├─ popup/
│  │  ├─ popup.html              # COMP-UI-POPUP
│  │  ├─ popup.ts
│  │  └─ popup.css
│  ├─ options/
│  │  ├─ options.html            # COMP-UI-OPTIONS
│  │  ├─ options.ts
│  │  └─ options.css
│  ├─ assets/                    # COMP-ASSETS
│  │  └─ videos/
│  │     ├─ goggins1.mp4
│  │     └─ goggins2.mp4
│  └─ types/
│     └─ index.d.ts
├─ public/
│  └─ manifest.json              # Manifest V3
├─ tests/
│  └─ unit/
├─ package.json
└─ vite.config.ts
```