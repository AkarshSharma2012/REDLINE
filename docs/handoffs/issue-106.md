# Issue #106 — Saffire-I evidence extraction

Two draft spread-rate rows transcribed from NASA NTRS tables; source inventory, proposed metadata, limitations and exclusions are in research/rows-saffire1.md. Used the authorized fewer-than-three-row completion path: only two distinct Saffire-I burns supported here. Do not duplicate later flights or endpoints to reach a quota.

Key decisions: leave unverified pressure/heat flux/oxygen scalar blank; preserve same-specimen sequential-burn caveat; no edits to data/, src/ or metadata.json. Next: independent scientific review before any production import.

Validation: exact 60-column header checked against data/evidence.csv; both rows checked for draft status and page-level provenance. node --test: 98 passed, 0 failed. git diff --check passed. Python/py are unavailable in this environment, so the requested python -m http.server and browser page check were not run; no UI or production data changed. The existing test suite does not independently validate the scientific transcription.

STATUS: DONE
