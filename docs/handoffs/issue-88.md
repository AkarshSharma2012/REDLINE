# Issue #88 handoff

Implemented scripts/size-budget.mjs and tests/size-budget.test.mjs without dependencies.
- Counts raw on-disk bytes of index.html, recursive src/ files, and immediate data/*.json; prints each file and total.
- Updated the budget to decimal 2 MB (2,000,000 bytes) per the revised issue. Fails when the total exceeds the limit; an exact-limit total passes.
- Current measured total: 657,914 bytes. No budget increase beyond 2 MB was needed.
- Rejects static external script/style/font/image references, including protocol-relative URLs; permits NASA citation/navigation URLs and embedded data URLs.
- Tests cover recursive counting, UTF-8 bytes, below/exact/above budget boundaries, external assets, citation exceptions, CLI failure and missing required files.

Verification:
- node --test: 100 passed, 0 failed; prints the size table and reports no external static resource violations.
- No site files changed. No browser, server, or persistent process started.

Limitations / outside owned files:
- Static checks cannot prove arbitrary computed JavaScript never requests remote resources or verify browser cache behavior. Offline reload and unvisited lazy views are not verified by these tests.
- Optional user-activated live AI in src/ui/ask.js uses api.anthropic.com; this is not a script/style/font/image dependency. The default retrieval mode uses local files.

STATUS: DONE
