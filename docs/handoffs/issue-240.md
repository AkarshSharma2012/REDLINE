# Issue #240 integration record

- Tested candidate: 9435a05f70a120e7ed2d085a982789d79ce8e092; tree 94558713292222d94f0c5dbdf9fb74119461956e.
- Base: 9df0e66fc9899353ec00c8208c1dd070757b6bb3. Scope: existing PR intent preserved; root task handoffs moved without byte changes. Existing main handoffs (including #224/#225) retained.

| PR | Repaired remote branch SHA | Handoff archive |
| --- | --- | --- |
| #237 | a20ffea7d50ec07fb4ce88c85be74b39e7c79653 | docs/handoffs/issue-171.md |
| #236 | e4881a0ae9bb302f7e43dd02c67ced0d21251842 | docs/handoffs/issue-60.md |
| #229 | 1231f7e3eedad953937369473e1696d6a1ae3efb | docs/handoffs/issue-95.md |
| #228 | fa15242111ea53b4455de3fd77af091994046a32 | docs/handoffs/issue-84.md |

- All four repairs merged sequentially on task/240 without conflicts. Git merge-tree against the combined candidate returned the same tree for each repaired head. Per-PR repair diff contains only the handoff rename; no root handoff remains in those PRs. Original application/test/document contents preserved.
- Full node --test on the actual combined candidate: exit 0; 1,136 total, 1,049 pass, 0 fail, 87 TODO, 0 skipped/cancelled. All four rover tests pass. node --check passed for all 91 tracked JS/MJS/CJS files. git diff --check passed.
- NOT a clean science/release pass: seven executed TODO assertions fail. Three concern unknown draft O2/pressure/endpoint fields; four are oxygen coverage (V2 U1, #234) and missing/mismatched pressure coverage (V2 U2, #235). No TODOs were added, removed or used to conceal new failures. #234/#235 owners retain those repairs; #230 owns catalog provenance. These priority changes are not in this tested base and require a fresh integrated run when merged.
- No evidence review status changed. Established-row rover citation coverage is conditional because production has zero verified rows; passing tests do not validate NASA evidence, live links or browser behavior.
- Repaired original branches were pushed atomically with ordinary fast-forwards, without force or changes to main or other worker checkouts. Local original worker branches intentionally untouched; their owners should fetch before resuming.
- Orchestrator must merge scientific fixes first, inspect final diffs/checks, and explicitly merge these auto-merge-skipped PRs. Recheck/retest after main advances. No server, browser, watcher or persistent process launched.

STATUS: DONE
