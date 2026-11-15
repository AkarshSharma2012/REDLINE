# Issue #297: B2 reference-faithful dark workspace shell

- Base main c4e6873. Owned files only: index.html, src/styles.css, src/styles/workspace.css, src/ui/workspace.js, DESIGN.md (narrow §4 amendment), tests/workspace-shell, mission-dashboard (geometry/token assertions updated, same intent), fixtures/workspace-dom (new IDs), new tests/workspace-layout.test.mjs. No A2 science files, viewer/model/scene, data, main.js or vendor edits.
- Composition (transcribed geometry, screenshot not seen): black 36px masthead + 36px tabs + 36px toolbar (<=111px incl. hairlines); setup rail 240px | records 400px | model+evidence remainder (55% at 1440) | 28px summary strip (real counts, selection, PSI link). 1px separators with 9px drag target. Rare layout controls in native "Layout" details (Escape/outside close, focus restore; masthead scope notes same on desktop). Dense hairline record rows. Empty 16:10 stage with user-triggered "Load rover model" (Three.js still lazy). Viewer tools become a right-edge strip on desktop via host CSS only. <1080px: one pane at a time via Setup/Records/Model switch; record/item selection reveals detail pane and focus returns on close. Shared --control-h (32 fine / 44 touch-narrow) and --bar-h tokens.
- Skills interface-design/ui-ux-pro-max/uncodixfy/impeccable/web-design-guidelines are not installed here: applied their principles as fallback, none ran.
- Tests: full node --test once on final code (Node v26.13.1): 1262 tests, 1218 pass, 0 fail, 44 existing TODO; size-budget PASS; git diff --check clean. No browser/server run: coordinator must capture 1440x900, 390x844, 320 reflow, all 6 tools, keyboard, 200% zoom, no-WebGL/context-loss fallback and perf.
- Next: coordinator visual review of the PR; no merge/deploy.

STATUS: DONE
