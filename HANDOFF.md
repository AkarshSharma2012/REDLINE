# Issue #287: Final NASA workspace integration

- Exact fetched inputs: main bed640032c895dfa9c8abefb815d5658efd5b37a, PR285 f44d08bf02fa6452bcb92ff525ab327e08bb02af, PR286 531b949e1ec03bb41004d066966ed41bd4827251.
- Tested integrated SHA: f6158b50d0d994b3528f9956bdd8c5eb24f5177a; subsequent commit changes handoff documentation only.
- Only conflict: root HANDOFF.md add/add. Both prior records preserved verbatim in docs/handoffs/issue-283-integration-pr285.md and issue-284-wording-pr286.md. No app/source conflicts.
- Full node --test once: 1247 tests, 1203 pass, 0 fail, 44 TODO, 0 skipped/cancelled; exit 0. Existing size/import/module graph checks pass.
- 45 draft / 0 verified retained; data/research/rules/schema unchanged. Exact source diffs and remaining TODOs: [verification](docs/handoffs/issue-287-verification.md).
- Next: coordinator owns final real browser acceptance and release via the one draft integration PR. No server/browser, merge/deploy, superseded PR closure, watchdog/automation/merger changes.

STATUS: DONE

# Issue #288: A2 workspace README correction

- Base: origin/main `bed640032c895dfa9c8abefb815d5658efd5b37a`; current issue branch only. A1 retains #287 runtime integration.
- Reviewed exact PR #285 `f44d08bf02fa6452bcb92ff525ab327e08bb02af` and PR #286 `531b949e1ec03bb41004d066966ed41bd4827251`.
- README only: distinguish no-install/no-build setup from pinned local GSAP/Three.js dependencies; link provenance/licenses; add pending-release workspace quickstart, native keys/camera, reduced motion/fallbacks and inspection/evidence limits.
- No app/vendor/data/research/rules changes, human verification, automation, browser or server. No new test: documentation-only. Existing 44 TODO remain unresolved, including data-integrity TODO diagnostics.
- Validation: full `node --test` once on `6b8e772367b1a3820c02e3dfefca18e4d8c3c081` (Node v26.13.1): 1,181 tests, 1,137 pass, 0 fail, 44 TODO, 0 cancelled/skipped. README: 58 lines; `git diff --check` clean. No browser/server run.
- Next: coordinator draft review and release integration; no merge/deploy.

STATUS: DONE

# Issue #291: A2 sync existing README PR #290

- Synced reviewed PR #290 head f650df409eed32293d5a44ee87b10addab05c858 with main 8b46d11937165779b1987a5a086956930d39ab68 on the assigned branch; both prior handoffs above retained verbatim.
- Pages run https://github.com/AkarshSharma2012/REDLINE/actions/runs/43749579228 completed successfully for that exact main SHA; build and deploy jobs both succeeded. README pending-release framing now reflects that release.
- Only README.md and HANDOFF.md differ from main; no app/vendor/data/research/rules edits, automation, browser/server, merge to main or deployment initiated.
- Validation: full node --test once on 76b9487957ddfffe9b1569e265a800a90874ba19 (Node v24.17.0): 1,247 tests, 1,203 pass, 0 fail, 44 existing TODO, 0 cancelled/skipped; exit 0. Existing TODO diagnostics remain unresolved. git diff --check clean. This final commit updates only this handoff.
- Next: coordinator review of existing PR #290; no merge/deploy.

STATUS: DONE

# Issue #293
- Recorded user-relayed Lakshya CORRECTION NEEDED review separately; retained HOLD/draft and B16. Nominal/inferred provenance carried in row notes and relevant displays/worksheet. A1 remains stopped. No server/browser.
- Validation pending.

- Native regeneration: node scripts/build-evidence.mjs (45 draft/0 verified), node scripts/export-datapackage.mjs, node scripts/verification-worksheet.mjs: exit 0. node --test: 1249 tests, 1204 pass, 1 stale pitch provenance failure, 44 TODO. Corrected pitch build reference; targeted pitch/review tests rerun. node scripts/size-budget.mjs PASS. node scripts/lint-csv.mjs reports 1 existing diagnostic; no unrelated evidence corrected. git diff --check clean. No build script exists; vendor integrity covered by full suite.
STATUS: DONE
- Follow-up: initial pitch update encountered an encoding error; corrected with byte-preserving replacement. node --test tests/pitch-demo.test.mjs tests/review-293.test.mjs: exit 0 (all pass). PR #294 opened; no merge/deploy.

# Issue #295: PR294 provenance and U25 display follow-up
- Fetched PR294 head 6d0e62d onto assigned issue branch. Restored frozen screenshot inventory hashes; current inventory checked separately.
- U25-only display adapters qualify inferred sheet and plot-derived five-second endpoint in Workspace, Ask, evidence panel and Gravity research. Stored enums and other rows unchanged; HOLD/draft and honest relayed review retained; PSI25-B16 unresolved.
- Regression anchors all non-U25 evidence rows to immutable c4e68732269e8986849109612a5d806fea401d15; surface assertions added.
- Next: native artifact regeneration, full node --test once, push to existing PR294. No server/browser, merge/deploy or verification promotion.
- Native build-evidence/export-datapackage/verification-worksheet completed (45 draft, 0 verified). First full suite found two stale surface expectations; updated them for qualified U25 text and its endpoint field. Final full rerun pending.
- Full node --test on 2a41a2da300a0a2501e3c27f81a30926971c82b7 (Node v26.13.1): 1250 tests, 1206 pass, 0 fail, 44 existing TODO, 0 skipped/cancelled; exit 0. git diff --check clean. Native worksheet/export regenerated with no content changes beyond evidence build metadata. No server/browser or persistent process started.
- Complete; push current branch HEAD to existing PR294 source branch only. Coordinator retains review/release ownership.
STATUS: DONE

# Issue #299: B1 viewer polish (rover viewer only)
- Base main 0aeaec1. Owned files only: src/ui/rover-{viewer,scene}.js, src/styles/rover-viewer.css, tests/rover-viewer.test.mjs. No shell/data/science/vendor edits; no GSAP added.
- Done: black stage (clear 0x000000); frame = stage + tool strip (right-edge 2-col strip when the viewer container is >=520px, wrapped row under the stage below that; never overlays the stage or list). 9 native buttons keep the old aria-labels: drawn SVG chevrons/plus/minus with CSS tooltip on hover + focus-visible, text buttons Reset/Shell/Wire. Information bar under the stage holds the single caption, selection, "Requested scenario (user input, not measured)", honest "Verification: none shown here" line, status and key help. Compact material rows with text "Selected"/"Not in current request"; empty-request state text. 3D selection = accent fill + text-1 edge outline (one merged LineSegments per material, disposed). Reset framing uses full bounding-sphere fit (was 0.92 crop). Targets 36px, 44px on coarse pointers; min text 12px.
- Unchanged: mountRoverViewer API, on-demand render scheduler, DPR cap 1.5, no shadows/textures/postprocessing/autospin, fallbacks, keys (Escape/Tab not captured).
- Tests: tests/rover-viewer.test.mjs adds 9-control redraw, caption-once/bar, CSS contract checks.
- Validation: full node --test (Node v24.17.0): 1253 tests, 1209 pass, 0 fail, 44 existing TODO, 0 skipped/cancelled; exit 0. size-budget PASS; git diff --check clean; impeccable detector: no findings.
- Browser limitation: no browser or server run (conductor rule); real WebGL pixels, 1440x900 / 390x844 / 320 layout need coordinator check.
- Next: coordinator review of the PR; no merge/deploy.

STATUS: DONE

# Issue #308: B1 neutral-white viewer selection (continues PR #303)
- Fast-forwarded from PR #303 head ecd6ae431aa21f5da9abb516cb2a31ba1dd52759; scalar patch f6d7004ee6969d1c7d89d6461d305b5aae362826 pushed to PR #303 branch task/299-ui-b1-polish-high-contrast-3d-viewport-a.
- rover-scene.js: SELECTED_COLOR 0x7cb8ff -> 0xffffff, SELECTED_EMISSIVE 0x1a3350 -> 0x3a3a3a. rover-viewer.css: --rv-accent fixed #FFFFFF (no blue page-accent inheritance). Black stage, selection outline, render-on-demand, hand-drawn icons unchanged. No B2/A2 shell/controls files, science, or global --accent edits.
- Tests: rover-scene selection test now asserts neutral (r=g=b); new CSS test asserts no 7CB8FF in viewer CSS.
- Full node --test once: 1254 tests, 1210 pass, 0 fail, 44 existing TODO, 0 cancelled/skipped; exit 0. git diff --check clean. No server/browser, merge or deploy.
- If B2 already incorporated old #303, coordinator integrates this scalar patch.

STATUS: DONE
