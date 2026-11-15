# PTFE, silicone and rubber evidence — issue #122

Nine draft rows extracted. No production data or metadata changed.

## Extracted source and results

**HWB06:** David Hirsch, Jim Williams and Harold Beeson, *Pressure Effects on Oxygen Concentration Flammability Thresholds of Materials for Aerospace Applications*. [NTRS record](https://ntrs.nasa.gov/citations/20070005041) identifies the copy as a preprint, dated October 2006. Final peer-reviewed publication status is **unverified** here; the PDF's journal heading alone does not establish it.

The following values are directly transcribed from [PDF/printed p. 4, Table 2](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=4). Each cell is a maximum oxygen concentration (MOC), volume percent; pressure headings are total absolute pressures from that table.

| Material as tabulated | 48.2 kPa | 85.3 kPa | 101.3 kPa |
|---|---:|---:|---:|
| PTFE | 53 | 46 | 42 |
| Silicone | 28 | 23 | 21 |
| EPDM Rubber | 18 | 16 | 16 |

MOC means repeated self-extinguishment under the paper's Test 1 protocol, not absence of ignition or flame spread. The procedure requires at least five passing samples and a failure at oxygen one percentage point higher ([p. 3, Experimental](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3)). Rows therefore use `MOC-T1`; `outcome` remains blank. Do not relabel these `LOC-FS` or `LOI-D2863`, or synthesize individual burn rows at the higher oxygen setting.

Specimens were approximately 1.5 mm thick and 6.4 cm wide; CSV width is converted to 64 mm. Quiescent vertical upward testing maps to `flow_speed_cm_s=0` (imposed flow only) and `upward-buoyant` ([p. 2, Background/Experimental](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=2), [p. 3, Experimental](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3)). Material identity is resolved through [p. 3, Table 1](https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf#page=3): Teflon TFE is PTFE; silicone rubber is polysiloxane. EPDM remains a separate material, not generic rubber.

## Unknowns and import limits

Form terminology, numeric gravity, external heat flux, duration, instrument uncertainty, specimen grade and individual run identifiers are **unverified** in the sections reviewed. Corresponding CSV fields are blank, except schema conventions `uncertainty=not stated` and `run_id=—`. Ground facility follows the described chamber experiment; numeric gravity is deliberately not assumed. The dimensional description suggests sheet specimens, but `form` is blank rather than an unsupported classification. The extraction contains table-level thresholds, not raw runs.

These research rows are not ready for direct production-schema import: required `form` and `gravity_g` remain unresolved, and silicone/EPDM material catalog entries need the owning integrator's review. All rows use `review_status=draft`, blank `verified_by`, and a common holdout group. Unknown heat flux is not zero. They must not drive cabin labels. No lunar result is inferred.

## Other reports found and skipped

- [Harper et al., *Oxygen Partial Pressure and Oxygen Concentration Flammability: Can They Be Correlated?*](https://ntrs.nasa.gov/api/citations/20160001047/downloads/20160001047.pdf#page=15), Table 2, PDF p. 15: matching PTFE, silicone and EPDM MOCs provide a cross-check, not additional independent rows. Its pressure headings differ in rounding from HWB06; retain the original table's pressures. [NTRS](https://ntrs.nasa.gov/citations/20160001047) catalogs this copy as a conference paper. Do not count its repeated values as a new holdout source.
- [*Polymer-Oxygen Compatibility Testing: Effect of Oxygen Aging on Ignition and Combustion Properties*](https://ntrs.nasa.gov/citations/20000102418): abstract identifies relevant elastomers and PTFE, but page-level post-aging flammability results were not verified. No rows extracted.
- [*A Model For The Burning of Teflon*](https://ntrs.nasa.gov/citations/20000102417): NTRS lists an abstract. Page-level experimental rows were not verified; no model-derived values extracted.
- [*Test System to Study the Ignition of Metals by Polymers in Oxygen*](https://ntrs.nasa.gov/citations/20000085164): abstract concerns polymer promoters on metal rods; page-level material-specific test conditions were not verified. No rows extracted.
- [ASTM publisher issue listing](https://store.astm.org/journals/volume/listing/coden/JTEVAB/issue/1/volume/36/online-issue-date/2008-01-01%2B00%3A00%3A00) surfaced a similarly titled polymeric-materials article in search, but opening the publisher page failed. Final article DOI, pagination and identity with HWB06 are **unverified**; no publisher text or values used.

The [NASA PSI repository](https://psi.nasa.gov/) remains the project's primary investigation dataset. This extraction uses NTRS ground screening evidence; no PSI experiment affiliation is claimed. Rockets and propellants were excluded.

## Proposed metadata entry (do not merge without review)

Use the source's preprint date, not an unverified final journal date. Title/authors/year are supported by the [NTRS record](https://ntrs.nasa.gov/citations/20070005041) and PDF title page.

```json
{
  "HWB06": {
    "title": "Pressure Effects on Oxygen Concentration Flammability Thresholds of Materials for Aerospace Applications",
    "authors": "David Hirsch, Jim Williams and Harold Beeson",
    "year": 2006,
    "url": "https://ntrs.nasa.gov/api/citations/20070005041/downloads/20070005041.pdf"
  }
}
```

## Verification

Source PDF text was opened at the cited pages. Table screenshot requests did not yield an inspectable image in this session; visual verification is outstanding. No graph values were digitized. CSV checks and repository test results are recorded in root `HANDOFF.md`. No server or browser was started.
