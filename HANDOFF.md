# Issue #267

- Revision B1 for PR #270 is done: header has two counts (Evidence | Verified), a single Research preview line and collapsed Scope and limits. Bound wording and crimson primary are removed. Details are in docs/handoffs/issue-267.md. Notes for #265 are unchanged in docs/handoffs/issue-265.md.
- Full `node --test`: 1175 tests, 1131 pass, 0 fail, 44 todo, exit 0. No server or browser was started.
- Next: the coordinator browser-checks at 1440, 390 and 320 px (Scope disclosures, real 45/0 counts), then refreshes the recording package.

STATUS: DONE

## Issue #271

- Wrapped the unchanged Airflow/Marcum articles in one closed native `details[data-source-context]`, summary `Source context and methods`; scoped summary minimum height 40px with existing keyboard focus styling.
- Envelope-unavailable warning and selected evidence panel remain outside. Draft research disclosure/selectors, scientific text, NASA links, data and event handlers unchanged. No index/main/global CSS edits.
- Added `tests/gravity-source-context.test.mjs`: exact pre-change rendered-article SHA-256, closed disclosure, warning/evidence placement, separate draft disclosure and summary styling.
- Verified: full `node --test` exit 0; focused gravity tests 17 pass / 0 fail; `node --check` for changed JS/test and `git diff --check` pass.
- No server, browser, persistent process or dependency added. Coordinator owns native keyboard open/close and final screenshots after both UI PRs merge.
- Next: coordinator review/merge task-branch PR.

STATUS: DONE

## Issue #273

- Cherry-picked only `49551a6` (seven `docs/screenshots/ui267-*.png`); historic unprefixed PNGs unchanged.
- `docs/pitch.md`: provenance `6455a3c`, current screenshot manifest (2026-11-15 ~08:49 PST, Chrome 1600x1000 CSS, 100%, localhost:5199, Evidence 45 / Verified 0), coordinator 1440/390/320 check, launch preflight for Scope and limits and Source context and methods; `HOLD_scientific_review` retained; Opus #255 "not yet approved" line removed; fallback uses ui267 shots. Historical manifest kept and labelled.
- `docs/pitch-variants.md`: shot-list provenance now points to ui267-02 and the local recording packages (`Downloads/REDLINE-recording-6455a3c`, fallback `52f6e73`); no video completion claimed.
- Full `node --test`: 1176 tests, 1132 pass, 0 fail, 44 todo, exit 0. No server or browser started.

STATUS: DONE

## Issue #277 (shell lane)

- Implementation SHA `23baa3f569cedfceb422e4f5972598c2992980cc` (tests-first commit `35bbe26a3708223d00c0779feef6efc197fb7ba7`), base `5094334`. Draft PR only.
- Files: index.html (cabin panel → toolbar + 3 panes + 2 separators; all old IDs kept), src/main.js (explicit bridge: `mountWorkspace`, `workspace.update/selectMaterial/setEvidence/setActive`, exported `resultForMaterial`), new src/ui/workspace.js (prefs, layout, separators, viewer bridge), src/ui/workspace-evidence.js (source browser, record detail, HTML cabin items), src/ui/workspace-motion.js, src/styles/workspace.css, src/vendor/gsap/{gsap.min.js,PROVENANCE.md} (3.15.1, sha256 recorded), .gitattributes (vendor byte-exact), DESIGN.md (narrow model + motion exception).
- Viewer interface consumed exactly as specified: `import('./rover-viewer.js')` only when view = "Model + evidence"; mounts into `#rover-viewer-root`; `update({materialIds, selectedMaterialId, conditions})` with frozen requested conditions; `onSelectMaterial` IDs validated against cabin items/registry and change UI selection only. Missing module/WebGL → status "Model unavailable…", HTML items stay. Viewer CSS (src/styles/rover-viewer.css) is not linked from index.html; coordinator adds the link at integration.
- Decisions: source filters sit at the top of the middle pane (beside the list they filter); left pane stays the cabin configuration. Selecting a cabin item opens the existing evidence panel through `renderEvidencePanel` directly, so it works with 0 verified rows (results table shows no rows then). Preferences key `redline.workspace.v1` stores only widths/collapse/density/view.
- Tests: tests/workspace-shell.test.mjs + tests/workspace-evidence.test.mjs (28 tests: structure, prefs incl. malformed/denied storage, bounded resize/keyboard/drag, viewer failure isolation and sync, real 45/0 counts, filters, detail Escape focus, motion reduced-motion/failed import, relative import integrity). Full `node --test`: 1207 tests, 1163 pass, 0 fail, 44 todo (pre-existing), exit 0.
- Gaps: no browser run (coordinator owns 320/390/1440, 200% zoom, real GSAP evaluation, console, visual hierarchy). Re-evaluating the cabin resets the evidence panel to its placeholder while the cabin item stays marked. Not tested in a real DOM: pointer capture, scrollIntoView, idle GSAP preload.

STATUS: DONE
