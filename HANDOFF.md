# Issue #52 handoff

Read README/AGENTS and S1/S2/S3/S4/V2 from their origin/task branches (not merged locally).
Owned implementation: src/ui/cabin-form.js, src/ui/results-table.js, tests/fixtures/ui-*.json.
Preserve scaffold renderCabinForm/renderResultsTable interfaces; dependency-inject labelCabin.
Fixture mode is explicit and never presents synthetic results as reviewed scientific data.
Next: implement, verify DOM flows, commit, push current task branch.
Integration owner must wire main.js onEvaluate/onChange to results and supply shared CSS.
