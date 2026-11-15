# Issue #150 — Engine examples

- Existing runner prints 12 distinct source-linked fixture queries through imported labelMaterial/compareRow; generated Markdown explicitly identifies stub output.
- Fetched origin: #55 implementation exists on origin/main (9df0e66), but this task branch still has stub label/compare/lunar modules. Engine files are outside this issue's ownership.
- Regenerated docs/engine-examples.md to restore exact CLI parity after checkout line-ending conversion.
- Verification: full node --test: 868 tests, 779 pass, 2 fail, 87 TODO. Regeneration fixes this task's parity failure; targeted tests then pass 3/3. Other failure: missing-fields report parity. No server/browser started.
- Next: conductor sync this branch with main's engine dependency; regenerate with node scripts/engine-examples.mjs --write and verify substantive labels/citations before marking done.

STATUS: BLOCKED: task branch needs #55 engine dependency synced from origin/main; current engine imports still resolve to stubs.
