# Issue #283: NASA workspace integration repairs

- Inputs: main `bed640032c895dfa9c8abefb815d5658efd5b37a`, shell PR #281 `bc74c93d02b6889a379c8afba41c5097cafe5d05` (merge `a96db38`), viewer PR #282 `b6233731ede82a75d029c39c097fbb88f7f314f3` (merge `46aa4dd`). The only conflicts were the lane root `HANDOFF.md` files vs main's renamed merger handoff; main's file kept, lane records kept verbatim in `docs/handoffs/issue-277-shell-pr281.md` and `docs/handoffs/issue-278-viewer-pr282.md`. No source conflicts.
- Repair commit `b7292d3` (index.html, src/styles/workspace.css, new tests/workspace-integration.test.mjs only):
  1. Middle pane: status → results table → NASA source records (filters/counts/cards) → closed native `details#ws-fixes-disclosure` "What changes the label and candidate experiments" holding the unchanged `#fixes`.
  2. At ≤1080px, `.workspace > #ws-pane-*` / `#ws-sep-*` reset to `grid-column: 1; grid-row: auto` (ID specificity matches desktop rules), panes `min-width: 0`.
  3. `.ws-viewer` host has no aspect-ratio/overflow/border; `.rover-viewer__stage` (unchanged) alone reserves 16/10 and clips.
- Checks: new tests (simple CSS cascade + DOM order) fail 3/4 on pre-repair files and pass 4/4 after. Full `node --test`: 1245 tests, 1201 pass, 0 fail, 44 todo. Lane files byte-identical to their input SHAs; `src/rules`, `src/schema`, `data`, `research` unchanged vs main; changed app files < 500 lines.
- Not run: no browser or server. Coordinator owns 1440/390/320, zoom, keyboard, WebGL and fallback runtime checks. Responsiveness is NOT claimed from static tests.
- Draft PR only; #281/#282 untouched.

STATUS: DONE
