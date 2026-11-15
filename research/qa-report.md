# Independent QA review — issue #60

Review target: `9df0e66fc9899353ec00c8208c1dd070757b6bb3`, branch `task/60-q1-qa-reviewer-pass-the-testing-agent`, 2026-11-15.

## Scope and limits

Reviewed the required project specifications, entry point, demo script, UI renderers and existing tests. Dependencies #164–#169 are closed in GitHub and their handoffs are present. Only this report and the required root handoff are changed.

The task's final hard rule prohibits starting a server or browser and requires Node-only verification. No server or browser was started. A real demo walkthrough, rendered layout, browser keyboard behavior and live external source availability remain unverified. Existing screenshots and earlier link reports are historical evidence, not fresh passes.

## Verdict

QA found six actionable defects, filed individually below. The Node suite exits successfully, but this is **not a full demo or release pass**: four executed TODO assertions expose incorrect science results, catalog citations disappear, and browser/source availability checks were prohibited or not performed.

## Verification results

- Environment: Windows PowerShell, Node `v24.17.0`, dependency-free checkout.
- Ran the full `node --test` once: **1,132 tests; 1,045 pass; 0 fail; 87 TODO; 0 skipped/cancelled; exit 0**, approximately 10.6 seconds. The runner prints failed TODO assertions after its summary; exit 0 does not mean those contracts hold.
- Seven TODO assertions reported failures: three data-completeness assertions (draft rows intentionally have unknown oxygen, pressure or endpoint) and four V2 U1/U2 label assertions. Unknown draft fields are not a bug by themselves; the four incorrect label results are bugs #234/#235.
- Ran a separate temporary `node --test` probe outside the checkout: one production-data inventory check passed; three desired-behavior assertions failed, reproducing missing catalog citations, malformed startup rejection and README wording. These four probes are **not included** in the 1,132-test suite count. No test or fixture files were added to the repository.
- Actual `data/evidence.json`: **45 rows, zero verified**, revision `data/evidence.csv@c78b68c2b7ae1c952eb9feb0d51c1a6e7f08b5aa`. Calling the real `evaluateCabin` for the four rover items at 34% O2 / 56.5 kPa / 0.16 g returns four `NOT_ESTABLISHED / NE-no-data` results. This is a missing-coverage result, not material approval. Counts and revision are local build metadata.

## Confirmed bugs

| Issue | Severity | Observed defect and reproduction | Expected behavior / owner area |
| --- | --- | --- | --- |
| [#230](https://github.com/AkarshSharma2012/REDLINE/issues/230) | High | All 26 catalog entries resolve their PSI ID with `source: null` through `field()`, although `data/investigations.json` supplies NASA sources in `provenance`. UI expects inline wrappers; catalog also uses different keys, e.g. `fire_safety_area` vs `fire_safety_areas` and `oxygen_range_pct` vs `o2_pct`. Rover rankings return tied zero scores. | Adapt the production contract and provenance deliberately in the dashboard/ranking layer. Do not manufacture absent data or interpret zero scores as equal scientific relevance. |
| [#231](https://github.com/AkarshSharma2012/REDLINE/issues/231) | Medium | An HTTP-success evidence response whose JSON is `null` passes `loadEvidence`; startup rejects with `TypeError: Cannot read properties of null (reading 'evidence')`. A Node child process with mocked fetch and minimal tab DOM reproduced this. | Validate the dataset shape and route failure through the Retry state; `showDataset`/`wireCabin` currently run outside the load catch in `src/main.js`. |
| [#232](https://github.com/AkarshSharma2012/REDLINE/issues/232) | High | README calls an absence label **“never tested”** and publishes Moon-base/hospital fire-risk claims without NASA links. Literal scan and assertion reproduce the wording violation. V2 D3/D4 already identify the wording problems. | README owner should use qualified absence wording and source or remove scientific claims; distinguish oxygen exploration from a risk score/certification. |
| [#233](https://github.com/AkarshSharma2012/REDLINE/issues/233) | Medium | `docs/pitch.md` describes 29 rows and a stub engine as the current build. This checkout has 45 rows and an implemented label engine. Captures target an explicitly older commit. | Demo owner should update current claims and rehearse/recapture when permitted. Keep the correct zero-verified caveat; historical captures are not fresh verification. |
| [#234](https://github.com/AkarshSharma2012/REDLINE/issues/234) | High | `tests/edge-cases.test.mjs` U1 TODO assertions execute and fail: a spread point at 20% for a 19.5% query, or no-spread at 19% for a 20% query, yields `NE-no-burn` instead of `NE-incompatible`. | Engine owner should require oxygen coverage before issuing no-burning wording, then enforce these regressions without TODO. Inputs are synthetic test boundaries. |
| [#235](https://github.com/AkarshSharma2012/REDLINE/issues/235) | High | The same file's two U2 TODO assertions fail: a 100 kPa query with a no-spread row at unknown pressure or 110.001 kPa yields `NE-no-burn` instead of `NE-incompatible`. | Engine owner should restrict no-burning coverage across missing/large-gap pressure while retaining appropriately flagged burning observations. Inputs are synthetic test boundaries. |

No application fixes were made: these changes belong to other owners. GitHub was checked for existing `BUG:` titles before filing.

## Demo path coverage

This is source/Node coverage of the complete scripted path, **not an interactive walkthrough**. Existing UI tests use DOM doubles and cannot establish real browser behavior.

| Demo step | Evidence from this checkout | Remaining check |
| --- | --- | --- |
| Cabin Check → Load lunar rover demo | Real engine inventory probe returns four absence results. `cabin-query.test.mjs` exercises form events/demo loader with an injected labeler; `main.test.mjs` checks tabs and panels. | Real click, rendering and focus order. Production zero-verified state cannot demonstrate a supported material burn label. |
| Investigations → Pressurized rover | Production adapter reproduction confirms #230; fixture-based investigation/ranking tests pass. | After contract repair, inspect actual catalog links, filter choices and rankings in browser. |
| Gravity → PMMA → draft detail → evidence record | `gravity-view.test.mjs` covers draft gating, source metadata, record inspection, unavailable counterparts, request forwarding and fetch Retry. `evidence-panel.test.mjs` covers mismatches, conflicts and source constraints. | Real expand/select/close actions and open the cited NASA locator. |
| O2 tradeoff → 30 → Cancel / Apply | `o2-slider.test.mjs` covers fixed conditions, all 51 sweep steps, explicit Apply, Cancel snapshot, presets without interpolation, engine error Retry and zero-verified state. | Native slider keys, actual tab/form synchronization and visual stale-result handling. |
| Accuracy | Existing baseline/resilience tests cover report display and malformed/missing data. | Browser rendering and current visible report content. Do not infer a measured accuracy score from software-test counts. |
| Ask → prepared lunar question → return to Cabin | Retrieval tests and resilience tests cover helpers, grounding/citation handling and missing-evidence Retry. Main mounts Ask on evidence load failure. No API key or model call used. | Browser form submission, scrolling, live announcements and end-to-end retrieval display. |
| Candidate experiment question | Experiment/fixes tests cover source-aware suggestions, malformed inputs and missing coverage. | Card display with current production query; keep inference and missing-coverage caveats visible. |

## Requested checks and practical limits

**Source links:** result-table helpers require HTTPS NASA URLs plus locators; engine wording tests check cited IDs resolve, and panel/slider tests check source constraints. `NE-no-data` is exempt from invented evidence citations under S4; the UI can show reviewed source inventory. With zero verified production rows, a supported combustion label was not demonstrated. The production catalog's missing citation defect is #230. Existing `docs/link-report.md` is historical, and `check-links.test.mjs` mocks HTTP: **no live NASA URL, redirect, PDF page or locator availability was certified**. No external scientific claim was validated by this code review. PSI remains the primary repository: <https://psi.nasa.gov/physci/repo/>.

**Wording:** engine explanation/wording tests pass for their enforced cases. A scan of `index.html` and `src` finds prohibited words in rejection guards/prompt prohibitions, which are not affirmative UI claims. README violates the rule (#232). This was not a universal audit of every research note, dynamic answer or external source. The V2 conflict about a universal 0 g/1 g bound is documented; no new scientific resolution is asserted here.

**Empty/error states:** existing Node tests cover empty forms/evidence, malformed view inputs, failed data fetches and Retry. Invalid main dataset shape escapes error handling (#231). Passing component doubles do not prove startup resilience or browser recovery.

**Keyboard:** static accessibility tests pass, tab code implements left/right navigation with roving tab indices, controls use native inputs/buttons, and the evidence-panel Node test covers Escape/Close focus restoration. Real Tab order, native range keys, visible focus, screen-reader announcements and absence of keyboard traps remain unverified.

**Crashes:** enforced suite reports no failures; malformed main startup does reject (#231). No blanket “nothing crashes” claim is justified.

## Handoff

Report and six bug issues complete under the Node-only constraint. Owners must resolve the high-severity defects and run the actual browser demo/source/keyboard checks in an environment where that work is authorized before claiming full demo readiness. No server, browser, watcher or other persistent process was launched by this task.
