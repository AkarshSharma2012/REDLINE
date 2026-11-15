# Issue #149 — Testing guide

- Added `docs/testing.md` from actual local tests/fixtures/scripts and dependency branches #144/#145; pending files are clearly separated.
- Covers commands, every test file, fixture isolation, adding tests, benchmark/generator behavior and golden regeneration.
- No implementation/data changes; no server or browser started.
- Verification: `node --test` on Node v26.13.1: 865 tests, 777 pass, 1 fail, 87 TODO, exit 1. Failure: `tests/missing-fields.test.mjs` / "checked-in report matches current evidence"; committed report differs from current evidence. Report repair is outside this issue's ownership. Log: `%TEMP%/redline-149-node-test.log`.
- `git diff --check` passed. Dependency scripts/tests #144/#145 were read from remote branches, not executed or merged.
- Documentation complete; existing suite failure and pending dependency integration remain for their owning issues.

STATUS: DONE
