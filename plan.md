## Implementation Plan

### Phase 0: Repository & Tooling Bootstrap

| #   | Task                                                                                  | PRD Reference |
| --- | ------------------------------------------------------------------------------------- | ------------- |
| 0.1 | Initialize Git repository, commit `README.md`, and apply MIT license.                 | INTRO-01      |
| 0.2 | Add project scaffolding with Vite + `webextension-vite` preset and TypeScript config. | TS-02, TS-03  |
| 0.3 | Configure ESLint, Prettier, and Husky pre-commit hook.                                | TS-04         |
| 0.4 | Establish root folder structure exactly as in *Project Directory Structure*.          | DIR           |

### Phase 1: Manifest V3 & Core Configuration

| #   | Task                                                                                                                                  | PRD Reference  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1.1 | Draft `manifest.json` with `service_worker` entry, permissions (`storage`, `webRequest`, `activeTab`), and host permissions wildcard. | COMP-BG, FR-03 |
| 1.2 | Implement TypeScript `Manifest` typings in `types/`.                                                                                  | TS-03          |
| 1.3 | Add static asset copy plugin to Vite for `public/manifest.json`.                                                                      | TS-02          |

### Phase 2: Storage Schema & Blocklist Service

| #   | Task                                                                            | PRD Reference              |
| --- | ------------------------------------------------------------------------------- | -------------------------- |
| 2.1 | Create `src/background/blocklist.ts` service for CRUD on `chrome.storage.sync`. | FR-01, FR-02, COMP-STORAGE |
| 2.2 | Implement unit tests for blocklist CRUD with Jest + jsdom mocks.                | TS-05, FR-01               |
| 2.3 | Enforce <50 ms storage operation budget with performance test harness.          | NFR-01                     |

### Phase 3: Background Intercept Logic

| #   | Task                                                                                                                     | PRD Reference  |
| --- | ------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 3.1 | In `background/index.ts`, register `chrome.webRequest.onBeforeRequest` listener.                                         | FR-03, COMP-BG |
| 3.2 | Compare request URL hostname against blocklist from `blocklist.ts`.                                                      | FR-03          |
| 3.3 | Redirect matching requests to `chrome-extension://<id>/content/overlay.html?target=<encodedURL>`.                        | FR-04          |
| 3.4 | Log metrics to `chrome.runtime.lastError` guard; ensure listener adds no >50 ms latency on non-blocked URLs (perf test). | NFR-01         |
| 3.5 | Provide message channel for content script to request original URL and navigation actions.                               | FR-07, FR-08   |

### Phase 4: Overlay UI & Logic

| #   | Task                                                                                                                                                                                                                            | PRD Reference       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 4.1 | Design `overlay.html` with dark backdrop, `<video>` element, and two `<button>` elements—initially `disabled`.                                                                                                                  | UI-01, UI-02        |
| 4.2 | Style elements via `overlay.css`, meeting WCAG AA contrast and focus states.                                                                                                                                                    | NFR-04, UI-01–03    |
| 4.3 | Implement `overlay.ts` to: <br>• Parse `target` param.<br>• Select random video from bundled assets (FR-10).<br>• Auto-play muted until user gesture unmute fallback for Chrome policies.<br>• Enable buttons on `ended` event. | FR-04, FR-05, FR-06 |
| 4.4 | Wire “Proceed” button to send message ‘proceed’ to background, triggering real navigation.                                                                                                                                      | FR-07               |
| 4.5 | Wire “Go Back” button to `history.back()` via content script.                                                                                                                                                                   | FR-08               |
| 4.6 | Add Jest DOM tests for disabled-state timing and button enablement after video end.                                                                                                                                             | TS-05, FR-06        |

### Phase 5: Options Page (Blocklist Management)

| #   | Task                                                                    | PRD Reference |
| --- | ----------------------------------------------------------------------- | ------------- |
| 5.1 | Build `options.html` with input, add button, and chip list of domains.  | UI-04, FR-01  |
| 5.2 | Implement `options.ts` connecting UI events to `blocklist.ts` service.  | FR-01, FR-02  |
| 5.3 | Validate domain input via regex, display inline error on invalid entry. | UI-04         |
| 5.4 | Perform accessibility audit (axe-core) on options page.                 | NFR-04        |

### Phase 6: Toolbar Popup

| #   | Task                                                                                                         | PRD Reference |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------- |
| 6.1 | Create `popup.html` with on/off toggle, “Pause 30 min” switch, and link to options page.                     | UI-05, FR-09  |
| 6.2 | Implement `popup.ts` to flip `enabled` flag in `chrome.storage.sync` and start Paused-until timestamp logic. | FR-09         |
| 6.3 | Ensure background listener respects `enabled` and `pausedUntil` during URL checks.                           | FR-09         |

### Phase 7: Video Asset Optimization

| #   | Task                                                                                    | PRD Reference |
| --- | --------------------------------------------------------------------------------------- | ------------- |
| 7.1 | Transcode source videos to MP4 + WEBM (H.264 + VP9) ≤720p to keep total size <10 MB.    | NFR-03, FR-10 |
| 7.2 | Place videos under `src/assets/videos/` and verify manifest `web_accessible_resources`. | COMP-ASSETS   |

### Phase 8: Testing, QA & Performance

| #   | Task                                                                                               | PRD Reference |
| --- | -------------------------------------------------------------------------------------------------- | ------------- |
| 8.1 | Write Jest tests covering >80 % statements across background, content, popup, and options modules. | TS-05         |
| 8.2 | Use Lighthouse to check performance impact when extension enabled vs disabled; document results.   | NFR-01        |
| 8.3 | Run manual cross-platform tests on Windows, macOS, Linux latest three Chrome stable versions.      | NFR-05        |

### Phase 9: Packaging & Deployment

| #   | Task                                                                                                             | PRD Reference |
| --- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| 9.1 | Generate production build via Vite, verify output folder size & integrity.                                       | TS-02, NFR-03 |
| 9.2 | Create ZIP package meeting Chrome Web Store guidelines; include privacy policy referencing zero data collection. | NFR-02        |
| 9.3 | Draft release notes mapping shipped features to requirement IDs for traceability.                                | OBJ-01–04     |

---

**End of Implementation Plan**
