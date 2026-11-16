# HANDOFF: issue #343

- Based on current main `9ef8313`, preserving the merged #344 source/citation fixes.
- Fixed the absent optional held-out CSV request without creating evaluation data: `build-ui` emits a URL only when the real CSV exists. Otherwise the loader returns the same empty rows and existing not-run view without an HTTP request. Explicit report URLs remain supported.
- Added focused coverage for four demo materials, lazy model loading/selection bridge, PMMA PSI25-B1 NASA report/provenance/locator, no-fetch absence, and explicit report success/error paths. JSDOM uses a viewer adapter, not real WebGL. Coordinator owns actual browser verification.
- No scientific data, review status, verified count, verification wording, pitch, video, or submission changes.

## Validation
- Regression before fix: 2 pass, 1 fail on the unwanted CSV request.
- `node --test tests/rover-demo-path.test.mjs`: 3 pass, 0 fail.
- Fresh full `node --test`: 1385 tests, 1341 pass, 0 fail, 44 existing TODO, 0 skipped, exit 0. This is not a claim that every assertion passes: the existing TODO assertions remain.
- `npm run build-ui`: passed. Repeated build produced byte-identical bundle, licenses, and optional report marker. Existing committed vendor assets unchanged.
- Locked dependencies installed with `npm ci`. All completed build/test/git child processes used explicit timeouts below five minutes. Direct shell git/npm startup hung, so subsequent commands used bounded Node child-process launchers.

## Changed files
- `scripts/build-ui.mjs`
- `src/ui/accuracy-report-url.js` (generated availability marker)
- `src/ui/accuracy-view.js`
- `tests/rover-demo-path.test.mjs`
- `HANDOFF.md`

STATUS: DONE
