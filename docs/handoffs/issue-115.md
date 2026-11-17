# Issue #115 handoff

- Read README.md, AGENTS.md, DESIGN.md, architecture, screens, evidence-engine, review and evidence-spec from the current checkout; all required files exist locally.
- Reviewed NASA/NTRS SPICE description and peer-reviewed ISS smoke-point paper. SPICE is Smoke Point In Co-flow Experiment; gas-flame soot onset does not establish solid-fuel flammability.
- Added research/rows-spice.md with source URLs, page locators, exclusions, access limitations, missing evidence and proposed metadata keys SPC09/SPC11. Metadata unchanged.
- Added header-only research/rows-spice.csv, using the exact data/evidence.csv header. No qualifying rows found; issue explicitly permits the documented insufficient-evidence fallback.
- Validation: node --test exited 0; existing TODO-marked assertions remain in the repository suite. Exact canonical CSV header and header-only row count passed; git diff --check passed. Only the two owned research files and this required handoff changed.
- No web server, browser or persistent process started, per the issue's hard rule.

STATUS: DONE
