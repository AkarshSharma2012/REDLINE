# Issue #86 handoff

STATUS: DONE

## Delivered
- scripts/gap-report.mjs reads data/evidence.json and writes docs/gap-report.md; optional input/output positional paths support fixture runs. No dependencies.
- Nine cells per catalog material: three requested atmospheres times 0 g, simulated lunar, and 1 g. Each cell reports total / verified rows; zero cells explicitly say EMPTY.
- All stored rows count, including drafts; verified counts are separate. This is an inventory report, not engine eligibility or independent experiment counts.
- Atmosphere matching requires both O2 and pressure, allowing 0.01 percentage point / 0.1 kPa rounding only. Gravity matches within 0.01 g of 0, 0.16, or 1; unknowns and other partial gravities remain outside the matrix.
- Source inventory includes every row, review status, conditions, NASA source URL and locator. No lunar interpolation or physical bounds are inferred.
- tests/gap-report.test.mjs contains a small inline synthetic S1 fixture, respecting the three owned files. It tests counts, draft separation, empty materials, rounding, unknown/mismatched conditions, citation failure, deterministic rendering, CLI output and failure without overwrite.
- Generated and committed report: 80/81 empty cells, one draft matching row, 28/29 rows outside the requested bins.

## Verification
- node --test: 100 passed, 0 failed (includes 4 new tests).
- node scripts/gap-report.mjs: successful against real data.
- Compared saved report to fresh pure renderer output: exact match; UTF-8 check passed.
- git diff --check: passed.
- Attempted python -m http.server: Python is not installed/on PATH; py and python3 also unavailable. Attempted local page via browser tool: browser access host unavailable. Browser/page verification could not run; no UI files changed.

## Next
- No implementation work remains for #86. Regenerate with node scripts/gap-report.mjs when evidence changes.
