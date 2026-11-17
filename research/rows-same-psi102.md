# SAME / PSI-102 extraction

Result: **zero eligible flammability rows verified**. The CSV intentionally contains only the exact header from `data/evidence.csv`. This completes the issue's insufficient-evidence path; it is not evidence that these materials cannot burn. Any future extracted rows must have `review_status=draft`.

## Identity and repository

The issue's expansion of SAME as “Spacecraft Atmospheres Material flammability” is not supported. NASA calls it Smoke Aerosol Measurement Experiment; the PSI record uses “Smoke and Aerosol Measurement Experiment(SAME)”. The [primary PSI-102 repository](https://psi.nasa.gov/physci/repo/data/investigations/PSI-102), Objectives, describes smoke particle size, transport and detector sensitivity. [NASA's investigation directory](https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/), Combustion Science, distinguishes SAME from SAME-R. The [related PSI-101 record](https://psi.nasa.gov/physci/repo/data/investigations/PSI-101), Objectives, identifies the reflight.

Access caveat: direct PSI page retrieval returned no readable body; targeted search exposed its indexed record, including a file named `PSI-102_Reports_SAME_Final Science Report.pdf`. The report itself and raw run files were not retrieved. Their contents and any additional flammability outcomes are **unverified**. No download URL was invented.

## Public reports reviewed and exclusion decisions

| Source | Verified scope / page locator | Decision |
|---|---|---|
| Urban et al., *Properties of Smoke from Overheated Materials in Low-Gravity*, publication year [2009, NTRS publication record](https://ntrs.nasa.gov/citations/20120012884) | [NASA full text](https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf#page=2), printed/PDF p. 2, §II: controlled overheating and aerosol statistics. [p. 4, §II.B](https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf#page=4): smoke generation and diagnostic apparatus. [p. 6, §II.C, Table 1](https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf#page=6): baseline particle diameters for Kapton, lamp wick, silicone and Teflon; sample-return contamination and convergence caveats. | Direct original-SAME evidence, but the table measures particle size, not ignition, spread, extinction, or a burn/no-burn endpoint. No eligible row extracted. |
| Urban et al., *Particle Morphology and Size Results from the Smoke Aerosol Measurement Experiment-2*, publication year [2012, NTRS record](https://ntrs.nasa.gov/citations/20130000422) | [NASA full text, printed/PDF p. 1, abstract](https://ntrs.nasa.gov/api/citations/20130000422/downloads/20130000422.pdf#page=1): identifies reflight, sub-ignition heating and smoke morphology/size measurements. | Related reflight context, not original PSI-102 run evidence. Sub-ignition heating is not a failed-ignition or flame-spread test. |
| *Smoke Characterization and Feasibility of the Moment Method for Spacecraft Fire Detection* | [NIST publication record](https://www.nist.gov/publications/smoke-characterization-and-feasibility-moment-method-spacecraft-fire-detection), Abstract / Citation / Download Paper; [journal DOI](https://doi.org/10.1080/02786826.2015.1025124). The record describes aerosol statistics and ground/flight comparisons. | Peer-reviewed journal report identified; full-text page-level extraction not performed. Numerical results **unverified** for this task and not entered. |
| *Pyrolysis Smoke Generated Under Low-Gravity Conditions* | [NIST publication record](https://www.nist.gov/publications/pyrolysis-smoke-generated-under-low-gravity-conditions), Abstract / Citation; [journal DOI](https://doi.org/10.1080/02786826.2015.1025125). Scope includes smoke plume, yield and particle structure. | Peer-reviewed journal report identified; full-text page-level extraction not performed. Numerical results **unverified** for this task and not entered. |
| *Evaluation of spacecraft smoke detector performance in the low-gravity environment* | [Publisher record](https://www.sciencedirect.com/science/article/abs/pii/S0379711216302181). | Search located the paper, but opening returned HTTP 403. Full text and numerical results **unverified**. No extraction from snippets. |

## Missing evidence and field handling

No qualifying material-specific flammability outcome with corresponding conditions and a page/figure/table citation was found in the sources reviewed. Aerosol diameter, detector response, pyrolysis rate, heater settings and aging time cannot substitute for the endpoints in `research/evidence-spec.md`. In particular, smoke production alone does not establish flame spread, and heating below ignition does not establish a no-burn result under an ignition protocol.

Needed before adding rows: a directly inspected report or run record reporting an eligible outcome, its material identity and geometry, atmosphere, flow, gravity context, and test criterion, with locators linking conditions to that same outcome. Unknown fields must remain blank; uncertainty should be `not stated` where required by the spec. No nominal cabin atmosphere, zero heat flux, or material geometry has been assumed. No lunar estimate is made.

The final science report and raw PSI files remain follow-up retrieval targets. A separate smoke/detection schema could retain the reviewed aerosol results, but adding such a schema or changing `data/` is outside this issue.

## Proposed metadata entry (not applied)

New proposed source key: `SM09`. This entry registers the reviewed original-SAME report for provenance only; it does not imply an eligible evidence row.

```json
{
  "SM09": {
    "title": "Properties of Smoke from Overheated Materials in Low-Gravity",
    "authors": ["David L. Urban", "Gary A. Ruff", "William Sheredy", "Thomas Cleary", "Jiann Yang", "George Mulholland", "Zeng-guang Yuan"],
    "year": 2009,
    "url": "https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf"
  }
}
```

Title and authors: [report title page, p. 1](https://ntrs.nasa.gov/api/citations/20120012884/downloads/20120012884.pdf#page=1). Year: [NTRS Publication Date](https://ntrs.nasa.gov/citations/20120012884). Metadata remains a proposal; `data/metadata.json` was not edited.
