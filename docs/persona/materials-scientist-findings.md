# Persona B2 findings: professional materials scientist (issue #224)

Persona: Dr. Rana Whitfield, 12 years in spacecraft materials flammability (NASA-STD-6001B Test 1; Marcum, Saffire, BASS-II papers). Skeptical, time-poor, intolerant of wrong numbers, missing units or uncertainty, and overclaiming.

## How the sessions were run (deviation from the issue text)

The conductor's hard rule forbids starting a web server or a browser, so the app was **not** served or driven in headless Chrome, and **no screenshots** were taken. Each session was driven in Node against the real modules the page uses (`src/main.js` wiring, `renderCabinForm`, `parseBom`, `labelCabin`, `renderEvidencePanel`, `retrieve`/Ask, gravity view text), with a small in-memory DOM double where a screen had to render. Desktop vs phone (1440x900 / 390x844) could not be compared without a browser; layout items are listed under LOOKS from the code and CSS only. A browser pass is still needed (see HANDOFF.md).

Where a session needed labels from real rows, a **test-only in-memory copy** of `data/evidence.json` had rows set to `verified`; nothing on disk was changed and no row was marked verified.

## Session log

| # | Tab | Goal | What she typed / clicked | Expected | What happened | Verdict |
|---|---|---|---|---|---|---|
| 1 | Cabin Check | Exploration atmosphere | Preset 56.5 kPa / 34% O2, 0.16 g, PMMA | Sourced preset, lunar estimate | Preset linked to R7-S4; lunar wording prefixed "Estimate between 0 g and 1 g results:" | Trust |
| 2 | Cabin Check | Same atmosphere in psia | Unit psia, 8.2 | 56.54 kPa | Query carried 56.53700980259999 kPa, shown with float noise in Oxygen tab and Evidence panel (B2-02) | No trust → FIXED |
| 3 | Cabin Check | Unit round trip | 56.5 kPa → psia → kPa | 56.5 back | 8.194632181956925 psia, back to 56.50000000000001; sourced preset de-selected (B2-02) | No trust → FIXED |
| 4 | Cabin Check | Typed psia value with kPa still selected | 8.2, unit kPa, 34% | Some warning | Accepted silently as 8.2 kPa (pO2 2.8 kPa) (B2-03) | Confusing → FIXED (hint) |
| 5 | Cabin Check | 30% O2 at 70 kPa, 0 g, SIBAL (verified copy) | Typed values, Evaluate | Burned, cites Saffire/GMT96 rows | App path returned "Not found in the sources reviewed": main.js passed the row array, engine expects the dataset (B2-01) | No trust → FIXED |
| 6 | Cabin Check | 21% / 101.3 kPa / 0 g SIBAL (verified copy) | Evaluate | Burned, cited rows | After fix: BURNED, cites B14-GMT96-T7/T8, B14-SAFFIRE-* | Trust |
| 7 | Cabin Check | Real app data today | Rover demo | Labels | Every label "Not found in the sources reviewed": 0 of 45 rows verified (B2-10) | Reported |
| 8 | Cabin Check | Edge 100% O2 | 100, 101.3 kPa, 0 g | Accepted | Accepted; PMMA BURNED citing M25-FS-M (LOC-FS 16.2% O2) on verified copy | Trust |
| 9 | Cabin Check | Edge 0% O2 | 0 | Rejected or caveated | Accepted; PMMA "No burning found in comparable tests at or below this oxygen level" (true but meaningless) (B2-12) | Confusing, reported |
| 10 | Cabin Check | Negative flow | -5 cm/s | Rejected | "Error: Enter nonnegative airflow or leave blank." focus moves to field | Trust |
| 11 | Cabin Check | Zero flow + quiescent | 0, Quiescent | Accepted | Accepted; quiescent with flow > 0 is rejected with a clear message | Trust |
| 12 | Cabin Check | Flow in m/s | 0.2 (meaning m/s) | Unit warning | Taken as 0.2 cm/s; label says cm/s but no hint (B2-11) | Confusing, reported |
| 13 | Cabin Check | Near limit | PMMA 18% / 101.3 kPa / 1 g (verified copy) | Weaker than Burned | NEAR "Close to a measured limit" citing M25-FS-G (18.8% O2) | Trust |
| 14 | Cabin Check | Lunar, no 1 g data | SIBAL 34% / 56.5 / 0.16 g (verified copy) | Range labelled estimate | Top label "Estimate between 0 g and 1 g results: Burned in testing at these conditions" from 0 g rows at 21% O2; 1 g side NOT_ESTABLISHED (B2-13) | Reported (science) |
| 15 | Cabin Check | Nomex MOC/ULOI rows | Nomex 23% / 101.3 / 1 g (verified copy) | Uses MOC 22.1% | NE-incompatible: MOC/ULOI are not spread endpoints under S4 rule E (B2-14) | Reported (science) |
| 16 | BOM import | BOM with brand names | Teflon, Plexiglas, PTFE (Teflon) | Teflon → PTFE | "Teflon" not recognised although the catalog name is "PTFE (Teflon)" (B2-04) | No trust → FIXED |
| 17 | BOM import | Typos | Nomx, cottn | Suggestion | Only "material not recognised"; no hint (B2-05) | Confusing → FIXED (suggest, never substitute) |
| 18 | BOM import | Units in cells | 0.3 mm, 0.3 cm, 2 in | Accept mm, explain others | "thickness_mm must be positive or blank." for 0.3 mm, which is positive (B2-06) | Confusing → FIXED |
| 19 | BOM import | Unknown materials | Kapton, silicone rubber, cellulose | Unknown stays unknown | Kept as unrecognised, NE-no-data, "not found in the sources reviewed" | Trust |
| 20 | BOM import | Case / spacing | "NOMEX", "nomex .", "PTFE  (Teflon)" | Match | Case matched; double space and trailing full stop did not (B2-04) | FIXED |
| 21 | Evidence panel | Inspect an unknown | Select the Kapton row | Readable heading | "Evidence: unrecognised:Kapton" (internal ID) (B2-08) | Confusing → FIXED |
| 22 | Evidence panel | Units and uncertainty | Select PMMA | Units on every value | Every field has its unit; uncertainty text shown, "Not stated" where absent | Trust |
| 23 | Gravity | Compare with cabin request | Open Gravity after evaluating | Readable request | Raw JSON `{"o2_pct":34,"pressure_kpa":56.537...}` with no units (B2-07) | No trust → FIXED |
| 24 | Oxygen | Same cabin across tabs | Open Oxygen after psia entry | Same pressure as Cabin Check | Showed 56.53700980259999 kPa vs 56.54 in Cabin Check (B2-02) | FIXED |
| 25 | Ask | Question the data cannot answer | "What is the NASA-STD-6001B Test 1 MOC of Kapton at 30% O2?" | "Cannot answer" | 8 Nomex MOC rows shown, status "8 rows retrieved", no word that Kapton is absent (B2-09) | No trust → FIXED |
| 26 | Ask | Banned-word bait | "Is PTFE safe at 34% oxygen?" | No "safe" claim | Rows retrieved only; after fix: "No row mentions: ptfe, safe. About those, the answer is: not found in the sources reviewed." | Trust |
| 27 | Ask | Data-supported question | "Will Nomex burn on the Moon?" | Lunar rows | OF12 lunar MOC*/ULOI* and U25-06-L rows; no coverage warning | Trust |
| 28 | Ask | Property not in data | "heat release rate of cellulose in microgravity" | Cannot answer | After fix: "No row mentions: release, cellulose" | Trust |
| 29 | Accuracy | Check the label agreement | Open Accuracy | Sourced table | Rendered from the checked-in eval report with source links (code review only) | Trust |
| 30 | Investigations | Find Saffire / BASS-II | Open catalog | PSI links | Catalog rows link PSI pages (code review only) | Trust |

## Findings

| ID | Severity | Where | Finding | Status |
|---|---|---|---|---|
| B2-01 | BUG | `src/main.js` | Cabin Check and the Oxygen preview passed the verified **row array** to `labelCabin`, which (since #55) expects the dataset `{ evidence, materials }`. Every material would read "Not found in the sources reviewed" even with verified rows: an overclaim of absence. | FIXED in 5144aab (`evaluateCabin`) |
| B2-02 | BUG | `src/ui/cabin-form.js` | psia → kPa conversion carried float noise (56.53700980259999 kPa) into the query, Oxygen tab and Evidence panel; unit switching drifted and de-selected the sourced preset. Now 0.001 kPa / 0.0001 psia, and the exact kPa is kept behind a switched value. | FIXED in 5144aab |
| B2-03 | CONFUSING | `src/ui/cabin-form.js` | Pressure typed in the wrong unit (8.2 kPa, 101.3 psia) was accepted silently. Now a non-blocking "Check the unit: 8.2 psia would be 56.537 kPa." note. | FIXED in 5144aab |
| B2-04 | BUG | `src/ui/bom-import.js` | "Teflon" / "acrylic" from the catalog's own bracketed display names, and names with double spaces or a trailing full stop, were not recognised. | FIXED in 5144aab |
| B2-05 | CONFUSING | `src/ui/bom-import.js` | Typos (Nomx) gave no hint. Now "Did you mean Nomex? It was not substituted": a typo is never silently remapped. | FIXED in 5144aab |
| B2-06 | CONFUSING | `src/ui/bom-import.js` | "0.3 mm" rejected as "must be positive". Now an explicit mm suffix is accepted; cm, m, µm and in are rejected with the conversion spelled out ("write 3 for 0.3 cm"), never converted silently. | FIXED in 5144aab |
| B2-07 | BUG | `src/ui/gravity-view.js` | Gravity tab showed the cabin request as raw JSON without units. Now "34% O2; 56.537 kPa absolute; forced airflow not specified; …; lunar scenario (0.16 g, estimate)". | FIXED in 5144aab |
| B2-08 | CONFUSING | `src/ui/evidence-panel.js` | Heading "Evidence: unrecognised:Kapton". Now "Evidence: Kapton (material not recognised)". | FIXED in 5144aab |
| B2-09 | BUG | `src/rules/retrieve.js`, `src/ui/ask.js` | Ask showed keyword near-misses (Nomex MOC rows for a Kapton question) with no statement that the data cannot answer. Now lists the question words no row mentions and says the answer about them is "not found in the sources reviewed"; status says retrieved rows are not an answer. | FIXED in 5144aab |
| B2-10 | BUG (data) | `data/evidence.json` | 0 of 45 rows are verified, so every live label is "Not found in the sources reviewed". Needs the human verification pass; agents must not mark rows verified. | REPORTED |
| B2-11 | CONFUSING | `src/ui/cabin-form.js` | Airflow is cm/s only; a value meant as m/s is taken as cm/s with no hint. Suggest a unit select or a hint like B2-03. | REPORTED |
| B2-12 | CONFUSING | `src/ui/cabin-form.js` | 0% O2 is accepted and yields "No burning found … at or below this oxygen level", true but meaningless for a cabin. Suggest a plausibility floor or note. | REPORTED |
| B2-13 | CONFUSING (science) | `src/rules/lunar.js`, S4 §5.4 | Lunar top label takes the most severe side; with 0 g rows at 21% O2 and no 1 g data, a 34% cabin reads "Estimate …: Burned in testing at these conditions". "At these conditions" overstates when the cited test O2 is below the cabin O2. Science lead to decide; wording not changed here. | REPORTED |
| B2-14 | CONFUSING (science) | S4 rule E | OF12 Nomex MOC/ULOI rows are excluded as non-spread endpoints, so Nomex reads NE-incompatible at 23% O2 even though MOC 22.1% is below it. Per spec; science lead to review. | REPORTED |
| B2-15 | CONFUSING (data) | `data/evidence.json` materials | Kapton, silicone rubber and cellulose fabrics are not in the catalog; brand aliases (Plexiglas, Perspex) are absent. | REPORTED |
| B2-16 | CONFUSING | `src/rules/retrieve.js` | Plural folding turns "quenches" into "quenche", which is then reported as unmatched. | REPORTED |
| L-01 | LOOKS | results table | `min-width:760px` table forces horizontal scroll at 390 px; suggest stacked rows on phone. No screenshot (no browser allowed). | REPORTED |
| L-02 | LOOKS | evidence panel | Request summary is one long semicolon-joined paragraph; suggest a definition list. No screenshot. | REPORTED |
| L-03 | LOOKS | BOM import | Inline styles on the drop zone and textarea; move to DESIGN.md tokens in the redesign. No screenshot. | REPORTED |
| L-04 | LOOKS | Cabin Check | The unit hint (B2-03) shares the plain pressure note line; the redesign may want caveat styling for it. No screenshot. | REPORTED |

## Top 5 a real user would hit first

1. Every label says "Not found in the sources reviewed" because no row is verified yet (B2-10), and before this fix it would have stayed that way even after verification (B2-01, fixed).
2. Entering the 8.2 psia exploration atmosphere showed 56.53700980259999 kPa across tabs (B2-02, fixed).
3. Ask answered a Kapton question with Nomex rows and no "cannot answer" (B2-09, fixed).
4. A real BOM with "Teflon", "0.3 mm" or a typo was rejected or unrecognised without explanation (B2-04/05/06, fixed).
5. The lunar estimate's "Burned in testing at these conditions" when the cited 0 g test was at lower O2 than the cabin (B2-13, reported to science lead).
