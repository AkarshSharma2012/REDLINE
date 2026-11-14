# BASS-II (PSI-25): data access and draft evidence

Issue #19. Research only. Access checked 2026-11-14. No application implementation.

## Findings

NASA PSI-25 supplies a downloadable experiment CSV, a DOCX README, run videos, original-video/still-image ZIP archives, proof-sheet PDFs, test-matrix and fan-calibration XLSX workbooks, and supporting documents. Anonymous downloads of the CSV, README, and one B1 video succeeded; this is a sampled access check, not verification of every archive. [S1, S2, S3, S4]

The experiment CSV is a run catalogue, not a ready-made extinction-limit dataset: it has 129 records and 17 columns, including initial/final calibrated oxygen but no dedicated extinction outcome, pressure, gravity, or continuous time axis. Those absences refer to the CSV header only. [S2, header and all records] The draft attaches observations separately from the NASA summary report's Table A.1. [S5, printed pp. 103-104 / PDF pp. 111-112]

## Sources and precise locators

- **S1 — NASA PSI, Burning and Suppression of Solids - II, PSI-25, version 4**, DOI 10.60555/4qc4-de67: [investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25), [public metadata](https://psi.nasa.gov/geode-py/ws/repo/investigations/PSI-25). Locators: `experimentalTable`, `added`, `version`, `doi`; live file tree is `POST https://psi.nasa.gov/geode-py/ws/files/v2` with body `{"folder":"PSI-25/","fileType":"study","studyId":"PSI-25","version":4,"obfuscationcode":""}`. These machine-readable sources have no printed pages; JSON paths and file names are their locators.
- **S2 — NASA PSI, PSI-25_Experimental table_BASS-II.csv**, file version 1: [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=67a3a17b09ed061032c19775&version=1&studyVersion=4). Locators: header and `PI` + `Test #` + `Sample #` + `Date` records (CSV has no pages). SHA-256: `71e792bf6b5fb5ea620c5dd70fbbac05515992e12aefcf5dff47312caa48c042`.
- **S3 — NASA PSI, PSI-25_Science Documents_BASS-II_ReadMe.docx**, file version 2: [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=692480587f6aa6a830210602&version=2&studyVersion=4). Locators: `Test Matrix explanation`, `Columns in test matrix`, and `Videos` paragraphs. DOCX was inspected through its paragraph text; no stable rendered page number is asserted. SHA-256: `69f32647792f54ab2a561e3cdafc6c87d854564fe487aed2b09265286bd84e1d`.
- **S4 — NASA PSI, PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4**, file version 2: [anonymous download resolver](https://psi.nasa.gov/geode-py/ws/studies/PSI-25/download?redirect=false&file=6924803a7f6aa6a8302103cc&version=2&studyVersion=4). Locator: Raw Data / Reduced Gravity / Bhattacharjee / B1. File downloaded and MP4 signature checked; no frame interpretation or video-derived outcome is claimed. SHA-256: `e82f64268c51efeea73a3f11e690a2f6e504845e980fb60356a6ef1584d273cd`.
- **S5 — Olson et al., Burning and Suppression of Solids-II (BASS-II) Summary Report**, NASA/TM-20210011385, October 2021: [NTRS record](https://ntrs.nasa.gov/citations/20210011385), [PDF](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf). Relevant locators: printed pp. 5-6 (apparatus and gas readings), p. 13 (extinction-velocity uncertainty), pp. 66-67 (flow response and gas measurements), Table A.1 pp. 103-104 (run records), Appendix B pp. 115-116 and Figure B.1 (oxygen offset). PDF page numbers are printed page + 8 for these locations. SHA-256: `5ffa911fd9b6356f204646003fb9342e341810dcdfdf5cb15756e7f01ec5f770`.

## File inventory and access

The version-4 public file tree contained 695 file leaves: 296 MP4, 265 ZIP, 127 PDF, two DOCX, two XLSX, one PPTX, one JPG, and one CSV. These are file counts, not run counts. All leaves had `restricted=false`; that metadata flag alone does not prove a download works. [S1, file-tree `files` descendants, `id`, `key`, `restricted`]

| Item | Listed format/location | Anonymous access result |
| --- | --- | --- |
| Experiment table | `PSI-25_Experimental table_BASS-II.csv`, Experimental table | HTTP 200, 16,590 bytes; parsed successfully [S2] |
| README | `PSI-25_Science Documents_BASS-II_ReadMe.docx`, Science Documents | HTTP 200, 21,538 bytes; opened ZIP/XML and read paragraphs [S3] |
| B1 video | `PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1.mp4` | HTTP 200, 5,803,980 bytes; MP4 signature checked [S4] |
| B1 still sequence / still archive | `PSI-25_Raw Data_BASS_GMT50_SAMPLE_147_TEST_B1_Still_Sequence.mp4`; `PSI-25_Raw Data_iss038e051108.zip` | Listed; downloads and archive contents not checked [S1, matching file leaves] |
| Test matrices / fan calibration | `PSI-25_Science Documents_BASS-II_Test.Matrices.xlsx`; `PSI-25_Reference Data_Fan calibration data.xlsx` | Listed; workbook contents and downloads not checked [S1, matching file leaves] |
| Summary report | `PSI-25_Reports_BASS-II Summary Report.pdf`; NTRS `TM-20210011385.pdf` | NTRS HTTP download succeeded, 48,972,416 bytes; text extracted [S1, S5] |
| Other supporting files | Engineering requirements PPTX, operations DOCX, science requirements PDF, proof-sheet PDFs and original-video ZIPs | Listed; not individually downloaded [S1, Engineering Documents / Science Documents / Raw Data leaves] |

Reproduce access: fetch metadata, request the file tree, then use the leaf's **id**, file **version**, and **studyVersion=4** in the download resolver. The response is a temporary signed URL; fetch it to obtain the actual file. No login, account, or authorization header was used. Do not save signed URLs in project files. Requests using names or S3 paths as the `file` parameter returned 404; the file-ID route succeeded. The generic `/studies/PSI-25` endpoint returned a permission message, while `/repo/investigations/PSI-25` and the working download resolvers were public. These observations do not establish that login is required. [S1-S4, access checks above]

## What a CSV record contains

The exact source columns, in order, are:

1. `PI`, `Test #`, `Date`, `GMT`, `Sample #`, `Fuel Sample Material`.
2. `Flow restrictor`, `Fan display`, `Air display`, `Radiometer gain   (1000   250   50   10)`, `Total Frames Shot`.
3. `Calibrated  initial O2 % by vol `, `Calibrated final O2 % by vol`, `Initial CO2 % by vol`, `Final CO2 % by vol`, `Initial CO (ppm)`, `Final CO (ppm)`.

Source: S2, header. Whitespace in these source column names is significant when importing.

The README explains that test IDs use the investigator's initial and matrix number, with suffixes for repeated runs; samples can be reused. Actual date and GMT day are distinct from the video date, which is one day late because of an onboard leap-year issue. Fan display usually means voltage multiplied by ten, but some entries instead contain control potentiometer settings. The air display measures duct speed in cm/s. Still-frame totals include post-burn images. Radiometer readings are uncalibrated and support relative intensity/dynamics, not absolute heat release. [S3, Columns in test matrix: Date, GMT, Test number, Sample number, Fan display, Air display, Radiometer gain, Total frames; S5, p. 5 and Table A.1]

## Caveats that must survive import

- **Flow lag:** the air-speed display responds slowly, about one minute; it is reliable as a steady reading only after a sufficiently long unchanged setting. The report gives display resolution of about +/-0.5 cm/s and describes daily fan-voltage calibration. Do not treat a displayed flow during a ramp as instantaneous flow at extinction. Low-speed calibration uncertainty, boundary layers, and transport lag add further limitations. [S3, Air display paragraph; S5, p. 66 and p. 13]
- **Oxygen correction:** the CSA-CP oxygen sensor was out of calibration. NASA applied a daily constant offset using the ISS Major Constituents Analyzer reference. Keep calibrated and raw readings distinct; do not apply the offset again to the CSV's calibrated columns. [S3, Calibrated initial and final O2 paragraph; S5, p. 6 and Appendix B pp. 115-116 / Figure B.1]
- **Initial/final oxygen is not an extinction measurement:** NASA describes these as before/after working-volume readings used for consumption and combustion-product analysis. **Interpretive inference:** a final oxygen value alone cannot establish the oxygen concentration at flame extinction or a material's limiting oxygen concentration. Table A.1 includes complete sample consumption, imposed flow changes, quenching and blowoff; these must remain distinct outcomes. [S5, pp. 6, 67; Table A.1 pp. 103-104]
- **Do not repair suspicious values silently:** B2's CSV calibrated final oxygen is 1.6 while Table A.1 has no raw final reading; B2 is excluded from the draft. B16's air-display entry differs between CSV and report. The draft preserves CSV conditions and flags the disagreement rather than choosing a reconstructed flow. [S2, B2 and B16; S5, Table A.1 pp. 103-104]
- **Scope:** draft rows are ISS microgravity, opposed-flow thin PMMA-family tests, not lunar predictions. The table/README describe Bhattacharjee's thin-film series; some individual material strings omit PMMA and are retained without silently expanding them. No material safety rating or lunar-gravity value is inferred. [S3, Test Matrix explanation; S5, section 2.1 and Table A.1]

## Draft evidence contract

`bass2-rows.csv` contains 15 selected Bhattacharjee runs. `origin/main`, this issue branch and `origin/task/33-w1-draft-the-submission-write-up-data-ai` were the only fetched remote branches inspected; `research/evidence-spec.md` was absent. The schema below is provisional and must be mapped to R1 later if its specification becomes available.

- `evidence_id` and `investigation` are editorial join identifiers; `pi`, `run_id`, `sample_id`, and `date_source` preserve the source identity.
- `material_source`, `flow_restrictor_source`, `fan_display_source`, `air_display_source`, and `o2_initial_calibrated_vol_pct` / `o2_final_calibrated_vol_pct` copy S2. Mixed strings stay strings; `none` becomes empty. Oxygen is volume percent. No pressure or numeric extinction threshold is supplied.
- `as_run_number` and `observation_paraphrase` come from S5 Table A.1, never from an inferred oxygen delta. Observations are paraphrased, not quoted. `flow_configuration` and `gravity_regime` come from the cited report context.
- `condition_source_title`, `condition_source_url`, `condition_source_locator`, `observation_source_title`, `observation_source_url`, and `observation_source_locator` provide provenance for each row. `caveat` records interpretation limits. Empty means unavailable, not zero.

The draft is deliberately selected and is not a complete test matrix or a balanced training dataset. **Recommendation:** before any quantitative boundary use, inspect the original video and matching fan-calibration workbook for the specific run. If a requested material/condition has no matching evidence, say **not found in the sources reviewed**.

## Verification

Downloaded public originals to temporary storage only. Parsed the NASA CSV (129 records, 17 columns), opened README DOCX XML, extracted the NTRS PDF, and matched selected run/sample identities and oxygen entries against Table A.1. Confirmed the report's printed pp. 103-104 are PDF pp. 111-112. Draft validation checks row count, unique IDs, exact copied source fields, valid source locators, and no app/config changes. The B1 MP4 download proves access, not a completed video analysis. No third-party transcriptions were used as data.
