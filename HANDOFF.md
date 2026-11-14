# Issue #107 — Saffire-II evidence extraction

Implemented `research/rows-saffire2.csv` and `research/rows-saffire2.md`: four draft silicone no-spread test points, NASA PDF page citations, proposed source metadata, source search and exclusions. Production data and application files untouched.

Key decisions: preserve initial flight oxygen as qualified context; do not invent per-test pressure, heat flux or duration. No-spread is distinct from no-ignition. `0` gravity represents microgravity class. Fabric flow assignment conflict excluded. Source/material registration belongs to the data owner.

Verification: PowerShell CSV round-trip checks passed: exact header equality with data/evidence.csv, four rows, draft status, page-level NASA citations, no-spread outcomes and blank unknown pressure/heat flux. `node --test`: 98 passed, 0 failed. `git diff --check`: passed. NASA PDF text reviewed directly; screenshot retrieval was unsuccessful. Python, python3 and py are unavailable, so the requested Python HTTP-server/page-opening check was not run. This research-only change does not alter the app.

Data owner follow-up: independently review transcriptions and register the source/material before integrating any rows; preserve draft status pending that review.

STATUS: DONE
