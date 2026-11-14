# Issue #54 — Gravity view

STATUS: DONE

Scope: `src/ui/gravity-view.js`, `data/gravity-points.json`,
`tests/gravity-view.test.mjs`, and this required root handoff. Current branch is
`task/54-b5-gravity-view-earth-predicted-vs-lunar`.

Read README/AGENTS locally and S1, S2/DESIGN, S3, S4, V2, R3 and R4 from their
`origin/task/*` branches. This checkout has no scaffold or package manifest yet.

Decisions:
- Follow S3 Gravity §4: oxygen versus supported airflow coordinates, never a
  continuous gravity curve. Unknown simulated-lunar flow is a separate reference,
  not a fabricated zero-flow measurement. Historical Nomex may use discrete gravity
  marks, with its differing endpoint criteria explicit.
- All R3 2025 extractions remain held for scientific review. Default view withholds
  those numeric series; optional research detail clearly separates draft digitized
  references and extrapolations from reviewed results. No engine labels or cabin
  thresholds are created by this screen.
- Preserve cotton flaming/smolder and Nomex Velcro/HT90-40 fabric separately.
- Include source-linked qualitative airflow context and Marcum's calibrated PMMA
  blowoff counter-example. No universal cutoff, bound, or agreement tolerance.

Implemented:
- Sourced display adapter with all 24 non-compensation R3 records, original IDs,
  review statuses, unknown/null fields, specimen/endpoint/conditions, extraction
  basis and NASA source locators. The JSON pins its R3 research revision.
- Standalone `renderGravityView(root, options)` and `loadGravityPoints()` exports.
  SVG airflow-coordinate chart and separate unknown-flow simulated-lunar reference;
  discrete historical gravity/endpoint marks; full equivalent tables; research gate;
  specimen selectors; source links; qualitative flow note and Marcum card.
- Back/evidence callbacks preserve the request; local evidence detail supports
  Close/Escape and focus restoration. Loading/error/retry and late-load cancellation.
- No dependencies, framework, build step or engine changes.

Verification so far: `node --test` passed 16/16 tests on Node v24.17.0. Tests cover
source/value preservation, review gates, SVG source/page links, unknown flow,
endpoint/specimen separation, partial/malformed/empty/error states, callbacks,
focus restoration, late loads, injection resistance and wording.

Browser verification completed:
- Served a temporary harness with exact copies of this module and dataset using the
  installed Python interpreter, `-m http.server 8055 --bind 127.0.0.1 --directory <temp>`.
  No harness or app-shell file was added to the repository.
- Headless Chrome: 13 desktop checks passed at 1258 px inner width; 14 checks passed
  with content explicitly constrained to 320 CSS px (browser minimum viewport was
  512 px). Checked review gate/default closed research detail, SVG mark/source links,
  unknown lunar flow, historical endpoint categories, cotton smolder separation,
  request preservation, evidence disclosure/Escape/focus restoration, equivalent
  table, no page overflow, computed SVG text fill and rendered minimum label size.
- Inspected desktop and narrow screenshots. Fixed SVG text fill, zero-flow label/axis
  overlap and minimum chart width; final chart/table scroll within their containers.
  Final `node --test`: 16 passed, 0 failed. `git diff --check` passed.
- Native browser control timed out; isolated headless Chrome succeeded. The initial
  sandboxed Chrome run could not start its GPU subprocess; elevated isolated test
  runs completed with browser exit 0. No user browser profile was used.

Integration needed outside owned files (do not edit here): scaffold/main router must
import `renderGravityView` and provide a root plus navigation callbacks. This branch
has no index.html/package.json; read scaffold from task/50 rather than copying it.
The S3 airflow-axis/no-continuous-gravity-curve requirement resolves the issue title's
loose “against gravity” wording. Scientific review is still needed to promote R3
records; none were promoted by this issue.

No remaining work within this issue's owned files. Standard `python`/`py` aliases are unusable;
the installed Python interpreter is at
`C:/Users/Neeraj Sharma/AppData/Local/Python/pythoncore-3.14-64/python.exe`.
