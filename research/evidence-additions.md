# B14: evidence additions and review queue

Issue #77. Extracted 2026-11-14. **Draft evidence: human scientific review required.**

## Appended evidence

16 new rows, taking the CSV from 29 to 45. The original 29 rows and header are preserved (checked against Git with line endings normalized). All new rows have `review_status=draft`, an empty `verified_by`, NASA source URLs and specific locators. No new dependencies or application changes.

| IDs (prefix B14-) | Count | Investigation | Endpoint and locator |
|---|---:|---|---|
| GMT45-T4, GMT100-T13, GMT175-T18, GMT178-T14, GMT190-T20, GMT190-T22 | 6 | BASS-II / PSI-25 | quench-limit; Zhao2015 p. 9 Appendix, named row; pp. 5-7 |
| GMT190-T21 | 1 | BASS-II / PSI-25 | blowoff-limit; Zhao2015 p. 9 Appendix |
| GMT175-T9, GMT175-T10, GMT178-T12 | 3 | BASS-II / PSI-25 | ignition / no-ignition; Zhao2015 p. 9 Appendix |
| GMT96-T7, GMT96-T8 | 2 | BASS / PSI-26 | burn/no-burn / spread; Zhao2015 Figs. 2-3, pp. 3-5, Appendix p. 9 |
| SAFFIRE-I-1, SAFFIRE-II-5, SAFFIRE-II-6, SAFFIRE-III-1 | 4 | Saffire-I/-II/-III | burn/no-burn / spread; Urban2021 Table 2 p. 8, section C pp. 7-8 |

### Source register (registered in data/metadata.json)

- **ZHAO15** � Zhao, T'ien, Ferkul and Olson (2015), *Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity*. [NASA NTRS PDF](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf). Methods pp. 2-3, Figs. 2-3 pp. 3-5, quenching pp. 5-7, Appendix p. 9. The Appendix has no table number; the named test row is the locator.
- **SAFFIRE21** � Urban et al. (2021), *Fire Safety Implications of Preliminary Results from Saffire IV and V Experiments on Large Scale Spacecraft Fires*, ICES-2021-266. [NASA NTRS PDF](https://ntrs.nasa.gov/api/citations/20210011521/downloads/ICES%202021-266%200503-2021%20final.pdf). This later report reproduces I/II/III conditions in Table 2 p. 8 and discusses their observed spread in section C pp. 7-8. Concurrent direction is corroborated by [NASA 20180005168 presentation, p. 30 Table 1](https://ntrs.nasa.gov/api/citations/20180005168/downloads/20180005168.pdf).

Primary repository context: [NASA PSI Data Repository](https://psi.nasa.gov/); [BASS-II PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25), [BASS PSI-26](https://psi.nasa.gov/physci/repo/data/investigations/PSI-26), [Saffire-I PSI-98](https://psi.nasa.gov/physci/repo/data/investigations/PSI-98), [Saffire-II PSI-99](https://psi.nasa.gov/physci/repo/data/investigations/PSI-99), [Saffire-III PSI-100](https://psi.nasa.gov/physci/repo/data/investigations/PSI-100). Published NTRS results supply the new row values; repository summaries are not substituted for run outcomes. Existing research/bass2.md documents PSI-25 access and initial/final oxygen caveats. No new PSI raw-video interpretation is claimed.

## Comparability and transcription decisions

- Quench rows store the final ramp speed and its flow-extinction endpoint; they are not LOC-FS values. Ignition failures remain `no-ignition`, not `no-spread`. Blank Appendix comments are not treated as evidence of a burn.
- BASS GMT96-T7/T8 match Figs. 2/3 by width, oxygen and flow. Figure captions omit IDs, so the mapping is explicitly inferential and needs review. No numerical spread rate is digitized.
- Zhao2015 reports 1 atm, converted to 101.325 kPa using the standard atmosphere definition. Digits express conversion, not measurement precision. 0.32 mm thickness is approximate. R1 E/D/G/H/A/U rules still apply; missing heat flux remains unknown, not zero.
- Ramp tests are not independent samples at every intervening speed. The BASS/BASS-II rows share one holdout group because they share material, apparatus and publication. The Saffire series also shares one holdout group; the paper's republication does not create independent evidence.
- Saffire dimensions and oxygen use the nominal 2021 Table 2, not the more precise values in the 2018 presentation. The presentation gives varying measured oxygen, 40.6 cm widths and 29 cm small-sample lengths, whereas Table 2 rounds to 21%, 41 cm and 30 cm. These are source differences requiring review, not precision to mix silently. Thickness remains blank.
- Saffire III-1: Table 2 gives 25 cm/s, also in the 2018 presentation; PSI-100 Approach gives 30 cm/s (previously recorded in research/investigations-sources.md). Keep the discrepancy visible. Do not use these rows as universal oxygen thresholds.
- Omitted oxygen-flagged GMT45-T1/T2, reused specimens, and blank-comment tests: these need more interpretation than their table alone supports. The Appendix's GMT45-T4 is the quench case; GMT45-T15 says no blow-off. This avoids repeating the earlier tentative T15 quench association in R1.

## Other requested investigations: reviewed, not forced into incompatible rows

**2025 lunar comparison:** [Urban et al., ICES-2025-392 corrected paper](https://ntrs.nasa.gov/api/citations/20250002114/downloads/ICES_2025-392-correctedcaptions.pdf), methods pp. 5-7, Figs. 7-12 pp. 8-9. The existing U25-01-L through U25-06-L already represent these simulated-gravity references. No duplicate rows appended. Ground curves need careful plot digitization and endpoint reconciliation; fitted intercepts and compensation factors are not new measured burn points. Preserve five-second extinction, gas-flame versus smolder outcomes, unknown induced velocity, ignition differences and simulated centrifuge acceleration. These tests do not establish behavior on the Moon or an empirical universal 0 g/1 g bound (V2 D1).

**ACME BRE:** [NASA 20220007191, slide 4](https://ntrs.nasa.gov/api/citations/20220007191/downloads/ACME%20CSSCI%2020220509.pdf) reports gas-fed burner results, including extinction below roughly 25% oxygen and differing persistence by size and gas fuel. [NASA 20170009141, p. 1](https://ntrs.nasa.gov/api/citations/20170009141/downloads/20170009141.pdf) describes the burner-emulation method. These are not material-specific LOC-FS measurements; burner diameter cannot become solid thickness. No ethylene/methane material IDs or burner/extinction-duration endpoints exist in S1. Preserve this result in the investigation interpretation/catalog workflow; do not mislabel it as a solid-material limit. No BRE CSV rows appended.

**SAME/SAME-R:** [NASA 20130000422, abstract p. 1 and experimental results section C](https://ntrs.nasa.gov/api/citations/20130000422/downloads/20130000422.pdf) describes smoke particles produced by heating below ignition. Particle-size/concentration endpoints and corresponding units are absent from R1/S1. Pyrolysis cannot be translated to `spread` or `no-spread`. No SAME CSV rows appended; the appropriate extension is a separate detection-evidence schema owned by the architecture/data team.

## Integration and verification (resumed 2026-11-14)

- Corrected all 16 saved additions to the schema-supported draft status, as requested. Empty verifiers retained; no row promoted to verified.
- Added ZHAO15 and SAFFIRE21 to data/metadata.json. Existing source entries and all other metadata are unchanged.
- Original 29 CSV rows and header are unchanged; the only changes to the saved B14 rows are their review statuses. Parsed output contains 45 rows, all drafts with registered sources and locators.
- node scripts/build-evidence.mjs succeeds: 45 rows, 0 verified. Generated data/evidence.json was used for verification, then restored because it is outside this issue's owned files; the integration owner must rebuild it for publication.
- node --test: 89 tests, 86 pass, 2 fail, 1 TODO. Both failures are hard-coded 29-row assertions in tests/schema.test.mjs (published CSV/JSON test and build-output test). Tests are outside B14 ownership; their owner should replace fixed counts with the parsed CSV length. The catalog-insights coverage TODO is separate.
- Python is unavailable on PATH. A temporary dependency-free Node static server returned HTTP 200 for /, /src/main.js and /data/evidence.json. Browser opening failed because the browser access host is unavailable; visual/interactive verification remains incomplete.

BRE/SAME endpoint support and fresh lunar digitization remain separate work, for the scientific reasons above. These additions must not drive labels or evaluation truth before human verification.

Fresh resume check (2026-11-14): build and preservation checks pass again; node --test remains 86 pass, 2 fixed-count failures, 1 TODO. Python remains unavailable. No additional scientific values or source entries changed.
