# Issue #164
- Added pure V2 query adapter and live onChange wiring with injectable labelCabin.
- Engine receives verified row arrays; item metadata stays in table/panel context.
- Empty/invalid inputs clear old labels; rover demo evaluates on load; evidence failures show results error + Retry.
- Targeted Node tests pass (3): query purity/nulls/duplicates, real form events through real table/NASA links, rover demo.
- Next: final full Node suite and push. No server/browser or src/rules edits.
