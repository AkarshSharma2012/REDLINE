# Cotton and cellulose evidence extraction — issue #123

Three draft rows are in `rows-cellulose.csv`: a tissue-paper burn point and two transient tissue-paper spread-rate measurements. No cotton-clothing oxygen limit was extracted. These are research candidates, not verified inputs to cabin labels.

## Extracted rows and citation map

- **CEL08-F2:** Kimwipes concurrent flame at 24% oxygen, 30 cm/s and 6.4 psia; exposed width 5 cm. [NASA/TM-2008-215260, printed p. 3 / PDF p. 7, Fig. 2](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=7). The caption explicitly identifies this point as not near a limit. `burn/no-burn` / `spread` is an editorial endpoint mapping. The holder thickness is not paper thickness and was not entered. Facility/microgravity context: [printed p. 2 / PDF p. 6](https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf#page=6).
- **CEL96-G-2-31:** chemical ignition; measured carriage speed 10.07 cm/s; mean-element flame spread rate 1.06 cm/s. **CEL96-G-2-19:** hotwire ignition; measured carriage speed 9.92 cm/s; mean-element flame spread rate 1.02 cm/s. [NASA CR-198537, printed pp. 55–57 / PDF pp. 67–69, text and Figs. 30–31](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf#page=67). Shared atmosphere: 18% oxygen, nitrogen diluent, one atmosphere; [printed p. 30 / PDF p. 42](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf#page=42). Paper identity and width: [printed p. 9 / PDF p. 23](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf#page=23). Definition and transient limitation: [printed pp. 31–33 / PDF pp. 43–45](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf#page=43). These rates average flame-tip and flame-base velocities; they are not a steady flame-front propagation limit.

Unit conversions are explicit in CSV notes: source cm multiplied by 10 for mm; cm/s multiplied by 10 for mm/s; one atmosphere becomes 101.3 kPa, and psia multiplied by 6.895 becomes kPa, per S4 section 2. No graph coordinates were digitized. Reported carriage speed remains distinct from flame-relative speed. `gravity_g=0` is the nominal microgravity class, not a measurement of exact zero: CR-198537 says run gravity was not recorded (printed p. 30). Group both rates under the same source for holdout evaluation. Paper is mapped to `sheet`; proposed `material_id=cellulose` requires registry review and must not be aliased to cotton fabric.

## What was skipped and why

- Cotton and cotton/polyester clothing: [Cavanagh et al., NTRS abstract](https://ntrs.nasa.gov/citations/20040084168) describes an apparatus and flight tests but provides no per-test flammability result. Do not turn apparatus dimensions into a test outcome. A direct PDF request was unavailable.
- Peer-reviewed follow-up identified and publisher abstract verified: Cavanagh, Torvi, Gabriel and Ruff, *Test method for evaluating fabric flammability and predicted skin burn injury in microgravity*, [Microgravity Science and Technology (2006), DOI landing page, Abstract and About this article](https://link.springer.com/article/10.1007/BF02870979). Publisher full text requires access; page-level numeric clothing results remain **unverified**. No numbers from search snippets or third-party summaries were extracted. The larger NASA conference PDF request exceeded the web reader size limit; its numerical results were not verified.
- SIBAL cotton/fiberglass: [Zhao et al., paper p. 2 (material), p. 9 (run appendix)](https://ntrs.nasa.gov/api/citations/20150008962/downloads/20150008962.pdf#page=2) is a composite, not ordinary cotton clothing. Not duplicated here because the assigned SIBAL task owns that extraction.
- NASA PSI remains the primary repository: [Physical Sciences Informatics](https://psi.nasa.gov/). This extraction uses public NTRS reports; no PSI raw-data match to these particular runs was verified. Do not label the older drop-tower results as BASS-II or ISS observations.
- Reduced-pressure cotton-clothing limits and a product-specific wipe certification were not found in the sources reviewed. No lunar behavior or universal gravity bound is inferred from these rows.

Unreported thickness, imposed external radiant heat flux, exact run duration and numerical rate uncertainty remain **unverified** and blank; `uncertainty` uses the required `not stated`. An unknown flux is not zero. No limit is inferred from a burn point or spread rate. No metadata or application files were changed.

## Proposed data/metadata.json source entries

Proposals only; do not merge without source/registry review. Dates and authors are from the respective report title pages.

```json
{
  "CEL08": {
    "title": "Microgravity Flame Spread in Exploration Atmospheres: Pressure, Oxygen, and Velocity Effects on Opposed and Concurrent Flame Spread",
    "authors": "Sandra L. Olson; Gary A. Ruff; Fletcher J. Miller",
    "year": 2008,
    "url": "https://ntrs.nasa.gov/api/citations/20080034883/downloads/20080034883.pdf"
  },
  "CEL96": {
    "title": "An Experimental Study of Ignition Effects and Flame Growth Over a Thin Solid Fuel in Low-Speed Concurrent Flow Using Drop-Tower Facilities",
    "authors": "Richard Dale Pettegrew",
    "year": 1996,
    "url": "https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf"
  }
}
```

The contractor report cover date is used; it differs from the thesis title-page date. [Cover and thesis title page, PDF pp. 1 and 3](https://ntrs.nasa.gov/api/citations/19970003005/downloads/19970003005.pdf#page=1).

## Verification

CSV header is byte-for-byte the first line of `data/evidence.csv` (apart from newline convention). Parsed using the repository CSV parser; all rows must remain draft with blank `verified_by`. Node test results are recorded in root `HANDOFF.md`. No server or browser process was started.
