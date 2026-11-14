# Independent evidence verification — issue #31

Audit date: 2026-11-14. Scope: all `*-rows.csv` files on the eight fetched `origin/task/*` refs below. This is a frozen-ref audit, not a claim about future branch updates. No application code was written.

**Result: 15/15 rows OK as attributed draft run transcriptions; 0 WRONG transcriptions; 0 wholly UNVERIFIABLE rows. None is ready for quantitative boundary labels.** Six required result/condition fields are empty in every row. OK means the populated claims agree with the sources in their stated role; it does not certify a physical limit, a safety rating, or lunar behavior. One inter-source discrepancy (B16) remains UNVERIFIABLE as a single reconciled air-display value.

## Collection and method

Read root README.md and AGENTS.md first; no existing root or nested HANDOFF was present in this checkout. Other branches' nested handoffs were not imported. Enumerated all paths, not just research paths, with `git ls-tree -r --name-only` for each ref, then read the row file with `git show`. Exactly one matching file was found. Its 15 records are preserved in [verification-input-bass2-rows.csv](verification-input-bass2-rows.csv); this is an audit snapshot, not an additional experimental dataset. Do not ingest it alongside the upstream original.

| Fetched ref (origin/task/) | Commit inspected | Matching row files |
|---|---|---|
| 18-r1-evidence-table-spec-and-comparability | 278d60b0a20a354cd88bc8c84e3762d4f39f78c8 | None |
| 19-r2-bass-ii-psi-25-data-access-and-draft | 38bb5579947c272f2e4e3863bd3e6ffb16af810a | research/bass2-rows.csv |
| 20-r3-nasa-2025-lunar-gravity-flammability | b24b04639b2105bb2152774e8cb9808847168c68 | None |
| 22-r5-nasa-s-position-standards-fm2-saffire | 3892357093f3835123d9ddfeb711318926448c5d | None |
| 24-r7-cabin-atmosphere-and-pre-breathe-valu | 1ea3b7e13f1e425b3452a148a6f58618ce4f46b4 | None |
| 30-w2-demo-script-and-pitch-outline | 0df4e860015e04d59e48f0861859d177a3a30b16 | None |
| 31-v1-verify-every-evidence-row-against-its | b24b04639b2105bb2152774e8cb9808847168c68 | None |
| 33-w1-draft-the-submission-write-up-data-ai | 3be0fae389cf85102b32d8b26329b97a7510a98f | None |

Rows exist, so the requested fallback audit of research Markdown factual claims was not substituted. `bass2.md` was read for the source-key dictionary and scope; `evidence-spec.md` section 2 was read as the proposed schema, not as scientific authority.

Independently downloaded the original NASA CSV and complete NASA report to temporary storage. No other agent's downloaded files or assertion of correctness was used. Matched each row by PI and test ID (unique match), then compared all 150 copied fields: PI, test ID, sample ID, date, material string, restrictor, fan display, air display, calibrated initial oxygen and calibrated final oxygen. All match exactly after the documented source `none` to empty conversion. Checked all 15 observation paraphrases, as-run IDs, geometry conversions, opposed-flow entries and page locators against report Table A.1. The report has 144 PDF pages; printed pp. 103–104 are PDF pp. 111–112. [N1, N2]

Access limitations: the web reader rejected the report as too large and could not open the PSI resolver. Direct HTTP retrieval succeeded for both originals. Installed a PDF text parser and read the downloaded report, including the two table pages and experiment context; no visual PDF rendering was performed. Table alignment was checked using layout extraction and the source column order. Videos, fan calibration workbooks and original instrument logs were not reviewed; a calibrated speed at each extinction event is therefore not independently established here.

## NASA sources actually inspected

**N1 — NASA PSI, Experimental table BASS-II (PSI-25).**
URL: https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=67a3a17b09ed061032c19775&version=1&studyVersion=4
Locator: CSV header and `PI=Bhattacharjee`, `Test #` and `Sample #` records listed below (CSV has no pages). The resolver returns a temporary URL; that URL was followed but is not committed. Download: 16,590 bytes, 129 records, 17 columns. SHA-256: `71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042`.

**N2 — Burning and Suppression of Solids–II (BASS-II) Summary Report, NASA/TM-20210011385.**
URL: https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf
Catalogue: https://ntrs.nasa.gov/citations/20210011385
Locators: Table A.1, printed pp. 103–104 / PDF pp. 111–112; section 2.1, printed p. 13 / PDF p. 21; instrumentation, printed pp. 5–6 / PDF pp. 13–14; flow transducer, printed p. 66 / PDF p. 74. Download: 48,972,416 bytes. SHA-256: `5ffa911fd9b6356f204646003fb9342e341810dcdfdf5cb15756e7f01ec5f770`.

All scientific statements below refer to N1/N2 at these locators. No third-party atlas or secondary transcription was accepted as evidence.

## Per-row results

Every ID below has prefix `PSI25-`. Oxygen pairs are **calibrated initial/final volume percent**, not limiting oxygen concentrations. Dimensions are **thickness × width in mm**, converted from source micrometres/cm where necessary. Each row's N1 locator is Bhattacharjee / test / sample, with date retained in the snapshot. N2 locators specify printed/PDF page and as-run ID. All are opposed-flow thin-film tests in the BASS-II ISS microgravity context (N2 section 2.1, Table A.1; `0g` is an editorial regime code, not measured exact acceleration).

| Test / sample / as-run | Dimensions mm | O2 initial/final vol% | Verdict | Independently checked observation and N2 locator |
|---|---|---|---|---|
| B1 / 147 / 7 | 0.1 × 20 | 22.2 / 22.2 | OK | Flow stopped after halfway spread; rapid extinction. Table A.1 p. 103 / PDF 111. |
| B6 / 153m / 57 | 0.1 × 20 | 21 / 20.9 | OK | Burning at 3 and 5 cm/s; consumed before reaching 10 cm/s. Table A.1 p. 104 / PDF 112. |
| B10 / 173m / 62 | 0.2 × 10 | 21 / 20.8 | OK | Steady spread at multiple settings; extinction at pot 0.35. Table A.1 p. 103 / PDF 111. |
| B11 / 158m / 61 | 0.2 × 20 | 21 / 20.7 | OK | Steady spread at multiple settings; extinction at pot 0.35. Table A.1 p. 103 / PDF 111. |
| B12 / 160 / 13 | 0.3 × 20 | 22.2 / 22.1 | OK | Predominantly blue flame; underside soot. Table A.1 p. 103 / PDF 111. |
| B13 / 162m / 63 | 0.4 × 20 | 21 / 20.5 | OK | Steady spread at multiple settings; extinction at pot 0.35. Table A.1 p. 103 / PDF 111. |
| B14 / 174m / 47 | 0.2 × 10 | 15 / missing | OK | Brief ignition followed by extinction. Final O2 absent, not zero. Table A.1 p. 103 / PDF 111. |
| B15 / 149m / 59 | 0.1 × 20 | 21 / 20.8 | OK | Spread at starting 10 cm/s; no blowoff on increasing fan. Table A.1 p. 103 / PDF 111. |
| B16 / 150m / 51 | 0.1 × 20 | 17.3 / 17.2 | OK, discrepancy below | Quenching after prolonged low-setting burn; top-side spread then immediate quench. Table A.1 p. 103 / PDF 111. |
| B17 / 175m / 48 | 0.2 × 10 | 17.5 / 17.4 | OK | Higher-flow steady burning; extinction as pot reached 0.4. Table A.1 p. 103 / PDF 111. |
| B18 / 176m / 49 | 0.2 × 10 | 17.4 / 17.4 | OK | Blowout at fan pot 7.0. Table A.1 p. 104 / PDF 112. |
| B19 / 151m / 52 | 0.1 × 20 | 17.3 / 17.2 | OK | Blowout at pot 6.0. Table A.1 p. 104 / PDF 112. |
| B20 / 152m / 50 | 0.1 × 20 | 17.4 / 17.4 | OK | Entire sample consumed. Table A.1 p. 104 / PDF 112. |
| B21 / 174m / 121 | 0.2 × 10 | 20.8 / 20.6 | OK | Gradual fan reduction; halfway spread; extinction at pot 0.355. Table A.1 p. 104 / PDF 112. |
| B22 / 176m / 126 | 0.2 × 10 | 20.7 / 20.5 | OK | Stepwise flow reduction; extinction at pot 0.36. Table A.1 p. 104 / PDF 112. |

Pot values in this table are dimensionless control settings, **not cm/s**. N2 p. 5 identifies velocity readout units; p. 66 reports slow transducer response and daily calibration. Inference: neither a pot setting nor the last displayed flow establishes instantaneous calibrated extinction velocity.

### Discrepancy and field-level limitations

- **B16 air display: UNVERIFIABLE as one reconciled value.** N1 B16 records `3  0.5 pot   0.4 pot`; N2 Table A.1 p. 103 records `3, 5 pot, 0.4 pot`. The draft correctly copies N1 and explicitly flags the conflict. Neither is silently corrected. To agree with the report alone, the middle setting would be **5 pot**, but the true setting cannot be decided from these two conflicting records. N1 supplies a fan entry where the report has a dash; this is different source coverage, not proof of an error.
- **Missing pressure and endpoint values: UNVERIFIABLE for every row.** No numeric per-run pressure or finalized calibrated boundary result is supplied in these drafts. Correct replacement is unknown; retain empty and exclude from numerical comparisons. Do not assume standard pressure.
- **Initial/final O2 is not an oxygen extinction threshold.** N2 p. 6 describes before/after working-volume measurements. Inference: their timing does not identify the oxygen at the extinction event. Do not turn final O2 into LOC. N2 section 2.1 reports low-speed calibration limitations; a report-level discussion is not an unambiguous per-run endpoint join.
- **Editorial mappings are acceptable only as mappings.** `sheet` maps source film to the schema; `0g` maps ISS microgravity to a regime. These are disclosed in row notes and must not become claims of exact acceleration. `material` retains varying source descriptions; N2 section 2.1.1 establishes the PMMA series context even for B12/B13 strings that omit the polymer name.
- **B14: ignition is not sustained propagation.** Its brief ignition/extinction narrative is supported; assigning a sustained-burning label would be WRONG. A suitable future endpoint classification is an editorial decision requiring an explicit criterion, not an oxygen-limit measurement. [N2 Table A.1 p. 103]

## Missing columns and unusable rows

Against R1 `evidence-spec.md` section 2.1 at commit 278d60b: **no required column headers are missing** (all 17 present; 40 columns total). Required cells `flow_speed_cm_s`, `o2_pct`, `pressure_kpa`, `endpoint`, `value`, `value_unit` are empty in **15/15** records. `uncertainty=not stated` describes no extracted result and does not solve this. B14 additionally lacks final calibrated O2. Source keys S2/S3/S5 depend on the upstream Markdown dictionary; separate titled condition/observation URLs do preserve the principal row provenance.

Recommended R1 section 2.2 headers missing: `external_heat_flux_kw_m2`, `limit_approach`, `pass_criterion`, `test_duration_s`, `o2_partial_kpa`. Their absence is a schema gap, not evidence that flux/duration are zero. `notes` exists. Partial pressure must remain uncomputed until total pressure and the relevant oxygen condition are established. Inference: add an explicit draft/eligibility field in a future evidence contract so narrative records cannot enter a numeric limit pipeline accidentally.

**Rows that should not exist in a production numeric boundary table:** all 15 in their current incomplete form. Retain them as source-linked draft observations. No fabricated or duplicate evidence IDs were found, and no draft row warrants deletion as a false experiment. Reused sample IDs B14/B21 and B18/B22 have different test IDs/dates/as-run numbers, so they are not duplicate runs (N1 matching records; N2 Table A.1).

Inference: do not split a changing-flow run into several independent tests or infer that higher cabin oxygen reproduces an observed burn at lower oxygen. B18/B19 are blowoff observations; B6/B20 are consumption outcomes; these do not by themselves supply oxygen extinction limits. No lunar numerical prediction is supported by these 15 ISS records. For absent combinations use **not found in the sources reviewed**.

## Verification and scope boundary

Checks passed: one input file, 15 records, 15 unique evidence IDs; unique NASA source join for every row; 150/150 copied fields exact; 15/15 dimensions and observation/page joins reviewed; six required fields empty in every record. Source-download sizes and SHA-256 values recorded above. The audit does not validate source instrumentation, perform video interpretation, establish complete literature coverage, or audit unrelated Markdown claims. No source correction to another agent's file was made; this independent report is the deliverable.
