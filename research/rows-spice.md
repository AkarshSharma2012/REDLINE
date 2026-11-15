# SPICE evidence review

## Result and scope

No qualifying solid-fuel flammability rows were found in the sources reviewed. `rows-spice.csv` intentionally contains only the exact header from `data/evidence.csv`. This completes the issue's insufficient-evidence fallback; it is not a claim that no relevant data exist elsewhere. No draft observations were fabricated to reach the requested minimum. Any future extracted rows require `review_status=draft` and independent review.

The issue's expansion of SPICE as "Smoke Particulate Interactions / ignition" is not supported by the reviewed NASA description. NASA names it **Smoke Point In Co-flow Experiment**, studying the onset of soot emission from gas-jet flames ([SPC09, PDF p. 1, Brief Research Summary](https://ntrs.nasa.gov/api/citations/20090014827/downloads/20090014827.pdf#page=1)).

## Sources reviewed and disposition

| Source | Locator and verified finding | Extraction decision |
|---|---|---|
| NASA PSI Data Repository, [SPICE investigation](https://psi.nasa.gov/physci/repo/data/investigations/PSI-107) | Primary dataset landing page. NASA's [PSI investigation index, Combustion Science section, SPICE entry](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/) independently confirms the investigation name and links the repository. | Repository cited for discovery, not as a run-level source. The direct page returned no readable text in this retrieval. Search-index descriptions and filenames were leads only; archives and raw video were not downloaded or exhaustively reviewed. |
| SPC09, Urban, Sunderland and Yuan, NASA/NTRS, *Smoke Point in Co-flow Experiment* | [PDF pp. 1-2, Research Summary / Detailed Research Description](https://ntrs.nasa.gov/api/citations/20090014827/downloads/20090014827.pdf#page=1): gas-flame soot formation and smoke-point objectives. [PDF p. 3, Operational Protocols](https://ntrs.nasa.gov/api/citations/20090014827/downloads/20090014827.pdf#page=3): fuel-bottle supply and adjustment of gas flow to soot onset. | Background and planned operations, not a solid-specimen results table. The listed igniter starts a gas flame; that is not a solid-fuel ignition threshold. |
| SPC11, Dotson et al., *Laminar smoke points of coflowing flames in microgravity*, peer-reviewed Fire Safety Journal | [Author-hosted PDF, printed p. 552 / PDF p. 3, Experimental methods and Table 2](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=3): ISS gas-burner methods and fuel-mixture smoke-point summary. [Printed p. 553 / PDF p. 4, Figs. 1-2](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=4): soot-onset images and luminous-length results. | Verified experimental results, but wrong specimen and endpoint for this task. Not promoted to material flammability rows. |

The peer-reviewed paper reports **55 smoke points** for ethylene, propane, propylene and propylene/nitrogen mixtures ([SPC11, printed p. 550 / PDF p. 1, abstract](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=1)). Its relevance is soot radiation and spacecraft fire modeling, not a measured solid-material spread limit ([SPC11, printed pp. 550-551 / PDF pp. 1-2, Introduction](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=1)).

## What was skipped and why

- Smoke-point lengths, fuel-flow measurements and soot correlations: these do not match the evidence-spec solid-fuel endpoints. **Extraction judgment:** mapping them to `LOC-FS`, `ignition`, `spread-rate` or `burn/no-burn` would change their scientific meaning.
- Burner diameters: apparatus dimensions, not solid-sample thickness. Gas mixtures cannot be relabeled as cabin fabrics, rods or sheets.
- Historical or estimated normal-gravity comparison data in the paper: not independent SPICE solid-material tests ([SPC11, printed p. 552 / PDF p. 3, Table 2 footnotes](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=3)).
- A NASA program-review PDF was discovered but retrieval timed out: https://ntrs.nasa.gov/api/citations/20130004397/downloads/20130004397.pdf . Its contents are **unverified** here and supply no values.
- PSI-indexed thesis and post-flight-report filenames remain discovery leads; their full contents and any additional qualifying solid-fuel outcomes are **unverified**. No values were taken from search snippets.

## Missing evidence and next step

A qualifying extraction needs a page-cited solid specimen, an allowed measured flammability endpoint/outcome, and the corresponding conditions and uncertainty. These were not found together in the reviewed SPICE reports. No supported mapping from gaseous smoke-point results to solid-fuel flammability was established. Unverified fields remain absent because no evidence rows were created; unknown conditions were not filled with standard atmosphere assumptions or zeroes.

Future work could review the PSI report archive for additional publications. A separate soot-emission dataset would need an explicitly approved endpoint/schema; it should not be merged into the current solid-material labels merely to increase coverage. No changes to `data/`, `src/` or metadata are proposed by this extraction.

## Proposed metadata entries (not applied)

New short keys reserved for the reviewed sources; no CSV rows reference them yet. The NASA report's year/authorship are verified against the [NTRS bibliographic record](https://ntrs.nasa.gov/citations/20090014827) and PDF title block. Journal metadata are verified on the [paper's first page](https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf#page=1).

```json
{
  "SPC09": {
    "title": "Smoke Point in Co-flow Experiment",
    "authors": "David L. Urban, Peter B. Sunderland, Zeng-Guang Yuan",
    "year": 2009,
    "url": "https://ntrs.nasa.gov/api/citations/20090014827/downloads/20090014827.pdf"
  },
  "SPC11": {
    "title": "Laminar smoke points of coflowing flames in microgravity",
    "authors": "K. T. Dotson, P. B. Sunderland, Z.-G. Yuan, D. L. Urban",
    "year": 2011,
    "url": "https://terpconnect.umd.edu/~pbs/2011%20Dotson%20et%20al.%20FSJ.pdf"
  }
}
```

SPC11 is hosted by a university author, not NASA; NASA's repository indexed the publication during discovery. Retain that distinction in any future source review.
