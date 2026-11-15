# Polyimide-family and Nomex extraction — issue #121

## Extracted

Four draft rows from [NASA/TM-2008-215260](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=7), printed p. 3/PDF p. 7, Table 1: Nomex HT90-40 fabric and Ultem 1000 polyetherimide film, each with a burning-survival and an extinction result. Nomex is kept separate from polyimide; these are not interchangeable material records.

Methods and dimensions: same PDF, printed p. 2/PDF p. 6, Experimental Apparatus, and printed p. 3/PDF p. 7, material descriptions. The atmosphere switches after ignition; these are brief flame-survival observations, not demonstrated sustained propagation. `ULOI` preserves the authors' survival endpoint; `extinction-5s` preserves their microgravity MOC definition. Neither is ASTM LOI, LOC-FS or Test 1 MOC. Outcome is blank to avoid asserting spread from survival. External heat flux and individual run IDs are unverified and blank. Uncertainty is not stated for the extracted results. All rows require independent review.

Conversions: pressure uses source psia multiplied by 6.895 per evidence-engine §2; film/fabric thickness uses source mil multiplied by 0.0254; sample width uses source cm multiplied by 10. Source locators are retained in every CSV row. Duration is the microgravity interval, not time to extinction. No graph digitization or interpolated values.

## Sources skipped and gaps

- **Kapton peer-reviewed lead:** Takahashi, Borhan, Terashima, Hosogai and Kobayashi, *Flammability limit of thin flame retardant materials in microgravity environments*, [publisher record](https://www.sciencedirect.com/science/article/abs/pii/S1540748918302852), [DOI](https://doi.org/10.1016/j.proci.2018.06.102). Publisher full text returned HTTP 403. Page-level numerical results are **unverified**; no rows extracted. Need accessible full text, test conditions and separation of measurements from model predictions.
- **Historical Kapton/Nomex compilation:** [NTRS 19760003644](https://ntrs.nasa.gov/api/citations/19760003644/downloads/19760003644.pdf), search surfaced Table 3-17. Full PDF exceeded the retrieval tool's content limit. OCR column alignment, original methods and page-level results are **unverified**; no values copied from search snippets.
- **Polyimide circuit-board lead:** [NASA TM X-64760](https://ntrs.nasa.gov/api/citations/19730017854/downloads/19730017854.pdf), search surfaced printed p. 35/Table XIV. Full PDF exceeded the retrieval tool's content limit. Board formulations and pass/fail mapping are **unverified**; no rows extracted.
- Ground comparison columns in the extracted report are attributed to WSTF reference 8; omitted rather than treating cited secondary results as additional independent experiments. Mylar is outside this issue's material scope.
- No Kapton numeric row or independently inspected peer-reviewed full-text result was obtained. This is a bounded extraction, not a claim of absent testing. No lunar prediction is made.

NASA's [PSI Data Repository](https://www.nasa.gov/physical-sciences-informatics-psi/) is the project's primary experimental-data repository; the rows here come from a public NTRS report, not a PSI run-file extraction.

## Proposed metadata entry (do not merge automatically)

New short key `OMR08`; all four rows share one holdout group because they share a report and apparatus. A `polyetherimide` material registration is also needed before promotion; do not alias it to Kapton.

```json
{
  "OMR08": {
    "title": "Microgravity Flame Spread in Exploration Atmospheres: Pressure, Oxygen, and Velocity Effects on Opposed and Concurrent Flame Spread",
    "authors": ["Sandra L. Olson", "Gary A. Ruff", "Fletcher J. Miller"],
    "year": 2008,
    "url": "https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf"
  }
}
```

Bibliographic fields: report title page, PDF p. 3. No metadata or production data files were edited.

## Verification

Table and methods checked against the NASA PDF text. Visual table-image verification was unavailable in the retrieval response; independent review remains required. CSV header and field counts, draft statuses, unique IDs and citation fields checked locally. Repository test results are recorded in root HANDOFF.md. No server or browser process started.
