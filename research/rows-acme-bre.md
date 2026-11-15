# ACME Burning Rate Emulator: extraction report

Issue #112. Extraction status: **insufficient verified test-level evidence**. The CSV is header-only, copied in the exact column order of `data/evidence.csv`. No test rows were emitted. Any future extracted rows must use `review_status=draft`; unknown fields must remain blank. This completes the issue's explicit insufficient-evidence fallback, not a claim that BRE data do not exist.

## Verified sources and findings

- NASA's [BRE investigation description](https://science.nasa.gov/biological-physical/investigations/bre/), sections “Science Objectives” and “Experiment Description,” describes a gas-fed porous burner emulating condensed fuels. These are not direct tests of named solid specimens. Burner size must not become specimen thickness.
- The primary NASA dataset lead is [PSI BRE investigation PSI-20](https://psi.nasa.gov/physci/repo/data/investigations/PSI-20). The page returned no readable content in this retrieval. Run files, conditions and outcomes from PSI are **unverified** here. No PSI values were transcribed. The [NASA operations page](https://gipoc.grc.nasa.gov/wp/fcf-cir/acme/burning-rate-emulator-bre-operations/), “Connect to BRE Data,” marks its data link as authorized-users-only; that does not establish the access requirements of the separate PSI repository.
- Dennis P. Stocker's [Recent Research on Flames of Gaseous Fuel Aboard the International Space Station](https://ntrs.nasa.gov/api/citations/20210022542/downloads/ACME%20JASMAC-33%2020211007.pdf#page=4), PDF/slide p. 4, reports aggregate self-extinction below approximately 25% oxygen by volume, larger-flame extinction generally within 1.5 minutes, and methane extinction within a minute. It does not identify the individual runs, precise atmospheres, burner sizes, fuel mixtures or uncertainty behind those summaries. These are contextual observations, not three independent flammability rows or a material-specific oxygen limit.

## Peer-reviewed reports located

NASA's [ACME Publications register](https://www1.grc.nasa.gov/wp-content/uploads/ACME-publications-20230830.pdf#page=2), p. 2, BRE entries 1–5, verifies these bibliographic leads (years below are from that page):

| Report | Authors | Year | DOI | Review outcome |
|---|---|---|---|---|
| Burning in microgravity: Experimental results and analysis | P. Dehghani; P. B. Sunderland; J. G. Quintiere; J. L. deRis | 2021 | https://doi.org/10.1016/j.combustflame.2021.01.035 | DOI retrieval failed; publisher page returned HTTP 403 on open. Search-indexed publisher content identifies experimental results, but the paginated tables were not inspected. Per-run values **unverified**. |
| Theoretical analysis and predictions of burning in microgravity using a burning emulator | P. Dehghani; J. G. Quintiere | 2021 | https://doi.org/10.1016/j.combustflame.2021.111572 | Bibliography verified; full text not reviewed. Predictions cannot be entered as measured tests. |
| Demonstrating steady burning for small flat materials in microgravity in a quiescent ambient | P. Dehghani; J. L. de Ris; J. G. Quintiere | 2023 | https://doi.org/10.1016/j.proci.2022.08.107 | DOI retrieval failed; full-text test values **unverified**. |
| Flammability maps for microgravity burning of a small flat material in a quiescent ambient | P. Dehghani; J. G. Quintiere | 2023 | https://doi.org/10.1016/j.combustflame.2023.112809 | DOI retrieval failed; map boundaries and measured-versus-modeled points **unverified**. |
| Transient dynamics of radiative extinction in low-momentum microgravity diffusion flames | A. Snegirev; E. Kuznetsov; E. Markus; P. Dehghani; P. Sunderland | 2021 | https://doi.org/10.1016/j.proci.2020.06.110 | Bibliographic lead only; full text not reviewed. |

Additional public lead: Anna Elizabeth Wright's [Using a Burning Rate Emulator to Analyze Flame Extinction Time on the International Space Station](https://drum.lib.umd.edu/items/b21822b4-9024-46d6-8cef-88f1e01a9d31), repository “Date,” “Authors” and “Abstract.” This is a thesis, not a peer-reviewed journal report. Its landing-page abstract is not a substitute for page-level test citations. A separate [UMD dissertation PDF](https://api.drum.lib.umd.edu/server/api/core/bitstreams/737cc34c-44b2-40c3-ab77-14bf9569edd8/content) found during full-text searching exceeded the web retrieval size limit; its contents and test tables remain **unverified**.

## Skipped and missing

- Skipped aggregate summaries, planned atmosphere grids, search snippets and uninspected tables. They cannot establish one outcome at one fully identified set of conditions under evidence-spec section 2.
- Did not reinterpret radiative extinction as flame-spread LOC, airflow quenching, no ignition or no burning. A gas flame that later extinguishes did burn during the experiment.
- The current evidence-spec endpoint vocabulary describes spread, regression, screening and ignition results; it does not explicitly define a gas-burner extinction-duration endpoint. An editorial schema decision is needed before representing such durations. No schema or material ID was invented.
- Needed for extraction: accessible paginated experimental tables/figures or PSI run files with source locators, explicit fuel mixture, atmosphere and pressure, imposed ambient flow versus fuel injection, outcome and shutdown/extinction distinction, time origin/duration and uncertainty. Mapping to a particular condensed material additionally needs the authors' verified emulation relation, not a name inferred from a gas fuel.
- No numeric test value or unknown pressure/heat flux was filled. Findings are limited to the sources reviewed; no lunar behavior is inferred.

## Proposed metadata entry (do not merge automatically)

New short source key: `BRE-S21`. This entry identifies the inspected NASA context report, not a source for invented per-run rows. Title, author and year are verified on its [title slide, p. 1](https://ntrs.nasa.gov/api/citations/20210022542/downloads/ACME%20JASMAC-33%2020211007.pdf#page=1).

```json
{
  "BRE-S21": {
    "title": "Recent Research on Flames of Gaseous Fuel Aboard the International Space Station",
    "authors": ["Dennis P. Stocker"],
    "year": 2021,
    "url": "https://ntrs.nasa.gov/api/citations/20210022542/downloads/ACME%20JASMAC-33%2020211007.pdf"
  }
}
```

`data/metadata.json` was not edited. No new row refers to this proposed key.
