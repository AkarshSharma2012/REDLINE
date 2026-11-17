# Judge Q&A prep sheet (issue #83)

These answers are for speaking with judges. Each one relies only on this repository and the NASA sources it cites.
Checked against `main` at `82f7364` (2026-11-15, after the UI merge in PR #255). Re-check the counts below if the data changes.

**Facts to get right:** `data/evidence.json` has **45 evidence rows, 0 verified** (all `review_status: "draft"`),
built from `data/evidence.csv`. `data/investigations.json` lists **26 PSI investigations**. `data/insights.json` has **30
AI-written insights, 0 checked by the team**. Because labels use verified rows only, the live app currently shows
**no evidence-backed label**. Say this before a judge finds it.

---

### Science rigor and data sources

**1. What is your primary NASA dataset?**
The NASA Physical Sciences Informatics (PSI) Data Repository (https://psi.nasa.gov/). The investigation catalog
(`data/investigations.json`) lists 26 PSI combustion investigations, including BASS, BASS-II, Saffire I-III, SAME/SAME-R,
DAFT, FLEX/FLEX-2, CFI, ACME (and its sub-studies), SPICE and SLICE. Each one has a source link. The evidence rows add NASA
NTRS papers: the BASS-II summary TM-20210011385, Saffire IV/V (Urban et al. 2021), Olson and Ferkul 2012, Zhao et al. 2015,
Urban et al. 2025 on lunar ignition testing, and the MIST NASA Task Book entry. The full list is in `data/metadata.json`
(`sources`). *Source: `README.md`, `data/metadata.json`, `data/investigations.json`.*

**2. How many data points are verified?**
None yet. There are 45 evidence rows: 15 from BASS-II, 12 from Zhao 2015, 6 from Urban 2025, 6 from Olson and Ferkul 2012,
4 from Saffire 2021 and 2 from MIST. All 45 are `draft`, with `verified_by: null`. The app's status line says this directly:
"N evidence rows, 0 verified (labels use verified rows only)". We did not promote any row to `verified` to make the demo
look better. A row only changes status after a person checks it against the source using `docs/verification-checklist.md`.
*Source: `data/evidence.json`, `src/main.js` (`verifiedOnly`, status line).*

**3. How do you trace a value back to NASA?**
Every evidence row has a `source_key`, which `data/metadata.json` resolves to a NASA URL. It also has a `source_locator`
giving the table, printed page, PDF page and test number. For example, PSI25-B1 points to "Table A.1; printed p. 103;
PDF p. 111; test B1" in TM-20210011385, and to the PSI-25 study file for conditions. Rows also keep `investigation`, `pi`,
`run_id`, `sample_id` and `date_source`. `docs/verification-checklist.md` and `docs/verification-demo-sheet.md` link each
row to its source and page. *Source: `data/evidence.json`, `docs/verification-checklist.md`.*

**4. How are the evidence rows checked?**
Research agents extracted the values. Separate verification issues (V1, V2) then re-checked them against the source PDFs.
Rows stay `draft` until a person signs them off. The row notes record what is still unresolved. For example, BASS-II rows
say "V1 #31 verifies transcription only; quantitative endpoint unresolved" and "B16 source discrepancy remains unresolved".
`scripts/verification-checklist.mjs` generates the human checklist, and it never changes a row's review status.
*Source: `docs/ai-use.md` section 4, `data/evidence.json` notes, `docs/verification-checklist.md`.*

**5. Where is the data weakest?**
Many BASS-II rows have no endpoint or numeric value (`endpoint: null`, `value: null`). Their initial and final oxygen
readings are cabin conditions, not extinction-oxygen measurements, and the fan "potentiometer" settings are source
notation, not calibrated flow speeds. The row notes say this. The 83 TODO tests in the suite still mark the draft rows'
unknown oxygen, pressure and endpoint fields (for example PSI25-B1 has no known endpoint type). The oxygen and pressure
coverage bugs (V2 U1 #234, U2 #235) are fixed: PR #242 and PR #247 merged before `b9e64d0`. The #240 integration record
lists them as open only because it was written before those merges. `docs/gap-report.md` and `docs/missing-fields.md` list
the remaining gaps. *Source: `data/evidence.json` notes, `src/rules/label.js` (`coversNoBurn`), `docs/gap-report.md`.*

### What the labels mean and do not mean

**6. How is a label decided? Is it AI?**
No. Fixed, deterministic rules in `src/rules/label.js` and `src/rules/compare.js` choose the label. The same input always
gives the same output, and `tests/determinism.test.mjs` and `tests/build-determinism.test.mjs` check this. `compareRow`
grades each comparable field of the cabin against a row in a fixed order (endpoint, material, form, thickness, width,
flow direction, flow speed, pressure, gravity, and so on) as OK, FLAG or INVALID. Only rows with no INVALID grade can
support a label. "Burned in testing at these conditions" needs a verified spread result at or below the cabin's oxygen.
"Close to a measured limit" needs a measured flame-spread limit within 1.0 percentage point (`NEAR_MARGIN_PP`), or wider
if the row states a larger error bar. *Source: `src/rules/label.js`, `src/rules/compare.js`.*

**7. What does "burned in testing at these conditions" NOT mean?**
It does not mean the material will burn in your cabin, and it is not a fire-risk score. It also does not certify a
material or set an oxygen limit. It means a reviewed NASA test of a comparable sample burned at that oxygen level, and the
UI shows that row's source link. Any field that differs between your cabin and the test, such as thickness or flow, is
shown as a flag next to the label. *Source: `README.md`, `src/rules/compare.js`.*

**8. What does "not found in the sources reviewed" mean?**
It describes a gap in the evidence we reviewed. It does not say the material does not burn or that no test exists. The
engine gives three different reasons: no verified data for the material (`NE-no-data`), rows exist but are not comparable
(`NE-incompatible`), or a comparable test did not spread (`NE-no-burn`). A no-spread result can only support a label when
the pressure comparison is OK. We never use "safe", "never burns" or "never tested", and `tests/wording.test.mjs` and
`tests/readme-wording.test.mjs` fail if those words appear. *Source: `src/rules/label.js`, `README.md`.*

**9. What happens when a test condition is unknown?**
An unknown value is not treated as zero. In `compare.js`, if either the cabin value or the row value for thickness, width,
flow direction, flow speed, pressure or gravity is missing, that field is graded FLAG ("not stated" / "not specified").
The flag stays visible on the label instead of being guessed away. An oxygen level that cannot be read gives no
burned or close result at all (`label.js` returns null). A no-burn label needs a pressure graded OK plus an oxygen limit or
no-spread result that covers the cabin oxygen (`coversNoBurn`, fixes #234/#235); a missing spread result is not evidence of
no burning. The
verification checklist repeats the same rule: "Unknown values are not zero." *Source: `src/rules/compare.js`,
`src/rules/label.js`, `docs/verification-checklist.md`.*

**10. How is the investigation ranking computed?**
`src/rules/rank-investigations.js` uses a points table that the user can see: fire-safety need 3, habitat 2, oxygen 2,
gravity 2, pressure 1. Need is one of prevention, detection or suppression. Each score is shown with its reasons, and ties
share a rank. The ranking shows how relevant an investigation is to the chosen habitat and need. It does not rate the
quality of the science. `tests/rank-investigations.test.mjs` tests it. *Source: `src/rules/rank-investigations.js`.*

### AI use

**11. Where did you use AI?**
In four places, listed in `docs/ai-use.md`. (1) Pre-generated plain-language insights in `data/insights.json`. (2) The Ask
REDLINE retrieval, which is keyword scoring, not AI. (3) An optional live answer that runs only if the user pastes their
own Anthropic key. (4) AI coding agents that built the app. Labels come only from the fixed rules, never from a model.
Be precise about the numbers: cabin inputs are user-requested values, comparisons are rule inferences, and neither is a
NASA measurement. The 45 evidence values are candidate records that research agents extracted from cited NASA papers. They
stay unverified (`draft`) until a person checks them, and a source citation does not prove the extraction is correct. We
make no accuracy claim for them. *Source: `docs/ai-use.md`.*

**12. How do you stop the AI from making things up?**
Each insight lists `cited_ids`. `tests/insights.test.mjs` checks that every cited id exists, that every bracketed id in the
text is listed (and every listed id is used), that the insight is 3-5 sentences, and that banned wording is absent. All 30
insights still show "AI-generated, not yet checked by team" (`checked_by_team: false`). The live answer only sees the
retrieved rows, has to cite row ids, and gets a caveat when a citation is unknown or missing. The retrieved rows stay on
screen beside the answer, because a model can still misread a row. *Source: `docs/ai-use.md` sections 1 and 3,
`data/insights.json`.*

**13. How was the app built with AI agents, and how was that controlled?**
Every task is a GitHub issue worked on its own `task/<number>-<slug>` branch and merged into `main` as a pull request. A
conductor ran parallel agent slots: A1/A2 for Codex and B1/B2 for Claude, as shown by smoke-test issues #11-#14. Agents
follow `AGENTS.md`, keep a `HANDOFF.md` (archived under `docs/handoffs/`), and must pass `node --test`. The integration
record for issue #240 shows how strict this was: 1,136 tests, 0 failures, 87 marked TODO. The seven failing TODO assertions
were reported openly and not hidden, and no evidence status was changed. On current `main` (`82f7364`) the full suite runs 1,150 tests: 1,067 pass, 0 fail, 83 TODO (`node --test`, exit 0).
Merges are reviewed by hand; no agent promotes evidence to `verified`. *Source: `AGENTS.md`, `docs/handoffs/issue-240.md`,
`docs/ai-use.md` section 4.*

### Why lunar gravity

**14. Why focus on the Moon and pressurized rovers?**
Lunar bases and rovers have their own gravity, and they may use oxygen and pressure settings that differ from the ISS.
NASA's own 2025 work, "Solid Fuel Ignition Testing for Lunar Applications" (Urban et al., ICES 2025-392), is in our
evidence set for this reason. The atmosphere presets come from NASA exploration-atmosphere sources in
`data/metadata.json`, such as the prebreathe protocol papers and the Life Support Baseline Values and Assumptions
Document. *Source: `data/metadata.json`, `research/lunar-2025.md`, `research/atmosphere.md`.*

**15. Do you have lunar-gravity flame data?**
Not direct data. For partial-gravity queries such as 0.16 g, `src/rules/lunar.js` runs the same rules once at 0 g and once
at 1 g. It shows both results side by side, with the prefix "Estimate between 0 g and 1 g results:" and the tag
"Cross-gravity comparison". These are context for comparison only, not universal physical bounds. The Gravity view says
"0 g / 1 g assumed envelope unavailable" and warns that lunar behaviour may fall outside a range between 0 g and 1 g
results. We do not interpolate a lunar value, and we do not claim a material will burn on the Moon. Olson and Ferkul 2012
compares microgravity and Martian gravity with the NASA normal-gravity test, which is why we do not assume behaviour
changes in a straight line with gravity. *Source: `src/rules/lunar.js`, `src/rules/label.js`,
`src/ui/gravity-view.js`, `data/metadata.json` (OF12).*

### Use and limitations

**16. What would a spacecraft designer do with this?**
Enter a bill of materials, or import a CSV (`data/sample-bom-rover.csv`), with cabin oxygen, pressure, flow and gravity.
For each material they can see which comparable NASA tests exist, which fields do not match, and where evidence is not found
in the sources reviewed. Each result links to the paper and page. The tool helps decide what to read or test next. It is
not a materials approval tool and does not replace NASA-STD-6001 testing (see `research/evidence-spec.md`). *Source: `README.md`, `src/ui/bom-import.js`,
`data/sample-bom-rover.csv`.*

**17. What are the main limitations?**
(a) There are 0 verified rows, so there are no live labels until people review the rows. (b) The 45 rows cover a few
materials, mostly PMMA and fabrics, from six sources. (c) Many rows lack endpoints or pressure. (d) The lunar view is a 0 g / 1 g
context comparison, not data and not a physical bound. (e) The insights are not yet team-checked. (f) The tests check code, not NASA facts:
the integration record says passing tests "do not validate NASA evidence, live links or browser behavior". *Source:
`data/evidence.json`, `docs/handoffs/issue-240.md`, `docs/ai-use.md`.*

**18. Is the dashboard running yet?**
Yes, on `main`. The UI pass merged through PR #255 (`82f7364`) with six tabs: Cabin Check, Investigations, Gravity view,
O2 tradeoff, Accuracy and Ask REDLINE (all but Cabin Check marked "Research preview"). An independent full run after the
merge gave 1,150 tests, 1,067 pass, 0 fail, 83 TODO, and desktop/phone tab, source-link audit and focus checks were done.
Wait for the GitHub Pages build to finish before saying the live site shows this UI. Because there are no verified rows,
the screen correctly shows that no evidence-backed result is available. *Source: `index.html`, `src/main.js`, `README.md`.*

**19. How do you know the rules work if no row is verified?**
Rule tests use fixture data in `tests/fixtures/` (`holdout-evidence.json`, `labels.golden.json`) that follows the same
schema as the real data. `tests/snapshot-labels.test.mjs`, `tests/label.test.mjs`, `tests/edge-cases.test.mjs` and
`tests/validate-rules.test.mjs` cover each label, rule grade and wording. That shows the logic does what the spec says. It
does not show that any NASA value is correct, and only human verification can do that. *Source: `tests/`,
`docs/testing.md`.*

**20. What would you do with more time?**
First, get people to verify the 45 draft rows using the checklist and resolve the endpoint and source discrepancies noted
in the rows. Second, fill the unknown draft endpoint, oxygen and pressure fields tracked by the 83 TODO tests (the #234/#235
coverage bugs are already fixed). Third, have the team check the 30
insights. Then add evidence from the other catalogued investigations, such as FLEX, Saffire I-III and SAME, so more
materials and conditions are covered. Lunar-gravity results stay an estimate until NASA publishes partial-gravity flame
data. *Source: `docs/gap-report.md`, `tests/`, `data/insights.json`.*
