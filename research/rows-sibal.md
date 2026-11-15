# SIBAL evidence extraction — issue #116

## Result and provenance

Extracted four draft quenching rows from [Zhao et al., NASA-hosted conference paper, p. 9 Appendix](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=9). Each row retains the original test ID and final flow from a decreasing-flow run; no intermediate state becomes an independent row. These are SIBAL **fabric** results within BASS-II, not evidence of a separately flown SIBAL payload.

The primary NASA dataset is [PSI Data Repository, BASS-II investigation PSI-25](https://psi.nasa.gov/physci/repo/data/investigations/PSI-25), sections Project and Approach. Numerical extraction here uses the public NTRS paper, not raw PSI video or instrument files. Source and run identity must be deduplicated against existing BASS-II rows before integration.

## Transcribed outcomes

All entries below cite the [Appendix, p. 9](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=9).

| Run | Oxygen (% volume) | Flow start → final (cm/s) | Outcome |
|---|---:|---:|---|
| GMT45-T4 | 18.7 | 10 → 2.2 | Quenched |
| GMT100-T13 | 17.5 | 4 → 2.2 | Quenched |
| GMT175-T18 | 17.4 | 5 → 2.6 | Quenched |
| GMT178-T14 | 16.9 | 4 → 2.8 | Quenched |

Shared conditions: approximately 0.32 mm fabric; width 2.2 cm converted to 22 mm; pressure 1 atm converted to 101.3 kPa. See [pp. 2–3 Experimental and p. 9 Appendix](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=2). Conversions follow S4 §2. `gravity_g=0` encodes ISS microgravity, not a measured acceleration. `value` and `flow_speed_cm_s` contain the final flow; oxygen is a fixed condition, not an extinction oxygen threshold.

## Source inventory and exclusions

- **Extraction source:** public NASA-hosted conference paper below. Appendix text was read directly; its PDF screenshot tool returned no usable image. Independent visual verification remains outstanding; all rows remain draft.
- **NASA summary:** [Burning and Suppression of Solids–II (BASS-II) Summary Report, chapter 7, Fig. 7.7 on printed p. 100](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf#page=108). Searchable chapter text corroborates the SIBAL study; no additional rows were extracted from this overlapping report.
- **Peer-reviewed report found:** Zhao, Liao, Johnston, T'ien, Ferkul and Olson, *Concurrent flame growth, spread, and quenching over composite fabric samples in low speed purely forced flow in microgravity*, Proceedings of the Combustion Institute, publisher record: [volume 36, issue 2, 2017, pp. 2971–2978; DOI 10.1016/j.proci.2016.06.028](https://www.sciencedirect.com/science/article/abs/pii/S1540748916300864). Publisher metadata/abstract were available through search; direct retrieval returned HTTP 403. Full-text numerical agreement is **unverified**. No rows attributed to that article.
- **Earlier concept report:** [Solid Inflammability Boundary At Low-Speed (SIBAL), NTRS record](https://ntrs.nasa.gov/citations/20040053507), Abstract. Describes a planned experiment; excluded as a source of completed ISS outcomes.
- Skipped reused samples, uncertain-oxygen runs, blank-comment runs, ignition failures, blowoff cases and other widths to keep a focused set of explicit wide-fabric quench outcomes. Reuse limitations: [p. 3 Results](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=3); oxygen warning and comments: [p. 9 Appendix](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=9).
- No graph digitization, model points, oxygen-limit inference, or lunar extrapolation. The authors say the oxygen minimum cannot be accurately determined by varying velocity: [p. 7 discussion and Fig. 7](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=7).

## Missing fields and integration

Run-specific uncertainty is not stated. External heat flux, exact duration, quantitative pass criterion, sample ID and measured residual acceleration are **unverified** and blank. No nominal zero heat flux is assumed. `verified_by` stays blank. `review_status` and `research_status` are `draft`. IDs, holdout group and material ID are editorial identifiers, not measured values. The proposed `sibal` material ID requires registry review before integration; do not silently alias this blend to cotton.

CSV header is copied byte-for-byte (excluding newline) from `data/evidence.csv`; optional unsupported provenance fields stay blank. No change to data or application files.

Proposed entry under `sources` in `data/metadata.json` (proposal only):

```json
{
  "SIB15": {
    "title": "Concurrent flame growth, spread and extinction over composite fabric samples in low speed purely forced flow in microgravity",
    "authors": "Xiaoyang Zhao; James S. T'ien; Paul V. Ferkul; Sandra L. Olson",
    "year": 2015,
    "url": "https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf"
  }
}
```

Bibliographic transcription: [title page, p. 1](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=1). This short source key distinguishes the conference version from the later journal article.

## Validation

Project CSV parser check passed: exact header, four records, run/flow/oxygen transcription, draft status and blank unknown flux. Repository node --test: 826 tests, 739 pass, 0 fail, 87 existing TODO. No server or browser started. Independent science review remains required before data integration.
