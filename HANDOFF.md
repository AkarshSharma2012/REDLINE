# HANDOFF: issue #224 (PX1 persona B2, materials scientist)

## Done
- 30 persona sessions, findings and top 5: `docs/persona/materials-scientist-findings.md`.
- Fixed (commits 5144aab and the docs/test follow-up): engine wiring in `src/main.js` (labels ignored verified rows), psia/kPa float noise and unit drift, wrong-unit pressure hint, BOM bracketed names / typo suggestions / mm suffix, Ask "no row mentions …" coverage note, Gravity request text with units, evidence panel heading for unknown materials.
- Regression tests: `tests/persona-b2.test.mjs` (9 tests, persona in each title). Updated `tests/cabin-query.test.mjs` to the dataset contract of `labelCabin`.

## Key decisions
- No browser or server was started (conductor hard rule), so sessions ran in Node against the real modules with a DOM double; no screenshots. A real browser pass at 1440x900 and 390x844 is still worth doing.
- Typos are suggested, never substituted; non-mm units are rejected with the conversion, never converted silently.
- No evidence rows, science wording or CSS changed.

## For humans (outside files this task may edit)
- `data/evidence.json`: 0/45 rows verified (all live labels read "not found"); add Kapton, silicone rubber, cellulose and brand aliases if sources exist.
- Science lead: lunar top label wording when cited O2 < cabin O2 (B2-13); MOC/ULOI exclusion by rule E (B2-14).

## How verified
- `node --test`: 1102 tests (1013 pass, rest skipped), all green except 2 that also fail on unmodified `main` in this Windows checkout (`missing-fields`, `verification-worksheet`: CRLF from `core.autocrlf=true` vs LF generated report; unrelated to this task, pass on LF checkouts).

STATUS: DONE
