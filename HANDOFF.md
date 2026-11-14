# Issue #88 handoff

Implemented scripts/size-budget.mjs and tests/size-budget.test.mjs without dependencies.
- Counts raw on-disk bytes of index.html, all recursive src/ files, and immediate data/*.json.
- Uses a strict decimal 600,000-byte limit; prints each file and total; CLI exits 1 on failure.
- Checks static HTML resource attributes, CSS URLs/imports, JS module imports and direct resource assignments, and asset URL keys. Citation/navigation URLs and embedded data URLs remain allowed.
- Tests cover external assets, protocol-relative URLs, citations, recursive counting, UTF-8 bytes, exact budget boundary, CLI failure, and missing required files. Fixtures are temporary directories, cleaned after tests.

Verification:
- node --test: 100 tests, 99 passed, 1 failed: the new repository budget assertion correctly rejects the existing 672,981-byte site. No external static resource violations found.
- node scripts/size-budget.mjs: prints size table and exits 1 for the same over-budget total.
- git diff --check: passed.
- Attempted python -m http.server 8088: Python is not installed/on PATH (nor py/python3); could not perform the requested browser smoke test.

Next / outside owned files:
- App/data owners must remove at least 72,982 bytes to meet the strict limit; data/investigations.json alone is 283,500 bytes. Do not weaken/skip the guard to make CI pass.
- Static checks do not prove arbitrary computed JavaScript cannot request a remote resource. Optional user-activated live AI mode in src/ui/ask.js calls api.anthropic.com; it is not a script/style/font/image dependency. Its default retrieval mode uses local files.
- Offline after full initial load, lazy-tab loads, and reload behavior still need browser verification. No service worker/cache changes are owned by this issue.

STATUS: BLOCKED: Existing site exceeds the required budget; reductions require changes outside this issue's owned files. Browser verification also needs Python/browser serving setup.
