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

## Issue #278

- Viewer lane only; no index/main/global CSS/shell/data edits. API: `mountRoverViewer(root, { onSelectMaterial })` -> `{ update({ materialIds, selectedMaterialId, conditions }), setVisible(bool), destroy() }` in `src/ui/rover-viewer.js`; pure helpers `src/ui/rover-model.js`; scene `src/ui/rover-scene.js`; scoped `src/styles/rover-viewer.css` (link added by mount, module-relative).
- Three.js r187 under `src/vendor/three/`. Decision: r187 ships no `.min` builds and the unminified core+module (2,133,699 B) alone exceed the 2,000,000 B site budget, so both upstream files were esbuild-minified (no bundling/edits; import specifier renamed) with hashes, command and MIT LICENSE recorded in `PROVENANCE.md` and checked by tests. Coordinator may prefer another resolution.
- Scene (measured in Node): 23 meshes cutaway / 26 shell (upper bound on draw calls), 684 triangles, 2 lights, no shadows/textures. Site budget now 1,609,103 B.
- Behaviour: lazy import only inside mount; render on demand (no idle RAF, no damping/auto-rotate), DPR cap 1.5, ResizeObserver width+height, 0x0 skipped, hidden pauses; failed import / WebGL creation / context loss -> HTML schematic + material list. Selection callback once per user selection; updates never call back; removed/unmodeled IDs show text, no highlight.
- Tests: `tests/rover-{model,scene,viewer}.test.mjs` (26). Full `node --test`: 1205 tests, 1161 pass, 0 fail, 44 todo, exit 0. Stub renderer only: no real WebGL, raycast pick, layout, screen reader or frame-count check was run. Coordinator owns Chrome checks.
- Draft PR #282. Next: coordinator Chrome checks (WebGL/no-WebGL, idle frames, shell integration) and a decision on the minified vendor build.

STATUS: DONE
