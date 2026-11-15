# REDLINE: methods and limitations

REDLINE organizes combustion evidence for fire prevention, detection and suppression in pressurized habitats and rovers. It is an evidence-review prototype, not a material qualification or cabin certification. Rockets and propellants are outside scope.

## Sources and collection

NASA's [Physical Sciences Informatics (PSI) repository](https://psi.nasa.gov/) is the primary dataset; NASA Technical Reports Server (NTRS) publications supply experimental context and reported endpoints. The source register is [data/metadata.json](../data/metadata.json). Examples are the [BASS-II summary report (BASS2-TM)](https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf) and [Olson and Ferkul (OF12)](https://ntrs.nasa.gov/api/citations/20130010991/downloads/20130010991.pdf), methods pp. 2–4 and Table I p. 6. Catalog coverage does not imply usable numeric evidence for every investigation.

One evidence row records one reported outcome and its conditions: specimen identity/form/dimensions, oxygen concentration, absolute pressure, airflow, gravity, facility, endpoint, uncertainty and run identity. Each row retains a NASA source key and page/figure/table locator. Unknowns remain empty, not zero. Documented unit conversions are allowed; invented conditions are not. Initial/final oxygen readings are not automatically extinction limits; fan settings are not calibrated flow speeds. Blowoff, full consumption and oxygen-limited extinction remain distinct. Conflicting values remain unresolved and documented rather than averaged.

## Review and verification

- **Draft:** extracted record, not independently checked; excluded from labels.
- **Reviewed:** extractor checked the transcription; awaiting a second reviewer; excluded from labels.
- **Verified:** a second reviewer checked specimen, conditions, endpoint and locator against the original source; `verified_by` records the issue/PR. Only these rows enter labeling.

The evidence build validates schema, units and provenance. Passing software checks does not verify a measurement or replace source review. Verification means faithful extraction, not independent reproduction of NASA's experiment. In the data snapshot inspected for this document, all 45 rows are draft: no live evidence qualifies for labels. Verified test fixtures demonstrate software behavior only.

## What the three labels mean

Labels come from fixed rules, with cited rows and mismatch flags, not an AI judgment.

- **BURNED — “Burned in testing at these conditions.”** Eligible same-gravity evidence reports spread at an oxygen level at or below the query, or a measured flame-spread limit at or below it. This is a rule-based transfer from the cited conditions, not proof that the requested cabin or exact product was tested or will ignite.
- **NEAR — “Close to a measured limit.”** The query is below a measured flame-spread limit within REDLINE's proximity margin: one oxygen percentage point, widened by parseable reported uncertainty. For limits in oxygen partial-pressure units, the margin is converted using query pressure. This margin is a project heuristic, not a NASA approval threshold, probability or ignition prediction. A single burn observation is not a measured limit.
- **NOT_ESTABLISHED:** `NE-no-data` means “Not found in the sources reviewed”; `NE-incompatible` means available rows cannot support the comparison; `NE-no-burn` currently means eligible rows did not trigger BURNED or NEAR. **That last code does not establish coverage at the requested oxygen level:** V2 identifies missing oxygen-coverage and pressure safeguards. None of these reasons establishes general non-burning behavior or absence of research elsewhere.

Positive results cite their NASA rows. A no-data result has no supporting experimental row; its context is the reviewed source inventory, not an invented citation.

## Earth, lunar gravity and the estimated range

Comparison grades are **OK**, **FLAG** (usable with caveats) or **INVALID** (excluded). Rules check endpoint, material, form, dimensions, airflow direction/speed, pressure, gravity, facility duration, external heating, limit approach/criterion and uncertainty. Matching oxygen partial pressure alone does not establish comparability. Missing fields and large differences can produce flags rather than exclusion; “comparable” therefore does not mean identical.

For partial gravity, the current engine repeats the query with gravity set separately to 0 g and 1 g, keeping other inputs unchanged. It retains both results and citations; the summary selects BURNED before NEAR before NOT_ESTABLISHED. It calculates no interpolated lunar threshold. The requested 0 g / 1 g “bound” is only an **assumed endpoint envelope**, not a validated physical bound. **Lunar behavior may fall outside this range.** OF12 Table I reports simulated-lunar Nomex limits below both endpoint-gravity results, with different duration-dependent criteria (pp. 4–6).

Short-duration simulated partial-gravity tests are not measurements in a lunar habitat. The current two-pass engine does not incorporate partial-gravity rows directly; V2 proposes a separate comparison. Missing either endpoint cannot establish a two-sided range.

## Remaining questions and AI

Coverage is sparse and review-gated. Product grades, geometry, ventilation, ignition energy, duration and pressure can change outcomes. Unresolved work includes V2's oxygen/pressure safeguards, partial-gravity integration, science review of heuristic tolerances, and evaluation on independent held-out experiments. Test-suite success alone establishes neither predictive accuracy nor certification. Suggested material changes or oxygen settings are questions for further testing.

AI agents assisted extraction, documentation and code; AI-written interpretations and optional answers can misread cited rows. They do not verify evidence or generate deterministic labels. See [AI use and checking procedures](ai-use.md).
