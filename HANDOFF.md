# Issue #265

- Synced origin/main (9c9bf01). Only tests/edge-cases.test.mjs changed; no src/data edits.
- Every one of the 39 `test.todo` cases in tests/edge-cases.test.mjs passed when run as enforced tests, so all were promoted to `test(...)`. They use synthetic boundary inputs only (software rules: compareRow P/T/W/V boundaries and quench, labelMaterial/baselineLabel precedence, O2 limits, missing O2, kPa O2 partial pressure, labelCabin routing, citation register lookup). No assertion weakened or case removed. Nothing left as TODO in this file: no case was failing or scientifically blocked.
- Full `node --test` before: 1158 tests, 1075 pass, 0 fail, 83 TODO. After: 1158 tests, 1114 pass, 0 fail, 44 TODO (remaining TODOs are in other files). edge-cases file: 6 pass / 39 TODO -> 45 pass / 0 TODO.
- No server, browser or persistent process started.
- Next: review and merge PR.

STATUS: DONE

- Integration: merged origin/main f065251 (PR #264 engine examples). Preserved issue #150 receipt in docs/handoffs/issue-150.md. Edge-case assertions unchanged; full-suite verification pending.
