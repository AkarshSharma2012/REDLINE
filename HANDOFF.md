# Issue #115 handoff

- Read README.md, AGENTS.md, DESIGN.md, architecture, screens, evidence-engine, review and evidence-spec from the current checkout; all required files exist locally.
- Reviewed NASA/NTRS SPICE description and peer-reviewed ISS smoke-point paper. SPICE is Smoke Point In Co-flow Experiment; gas-flame soot onset does not establish solid-fuel flammability.
- Added research/rows-spice.md with source URLs, page locators, exclusions, access limitations, missing evidence and proposed metadata keys SPC09/SPC11. Metadata unchanged.
- Added header-only research/rows-spice.csv, using the exact data/evidence.csv header. No qualifying rows found; issue explicitly permits the documented insufficient-evidence fallback.
- Next: validate CSV/header, run node --test, check scope, commit and push current task branch.
- No web server, browser or persistent process started, per the issue's hard rule.
