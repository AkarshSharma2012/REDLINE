# Issue #240 integration

- Scope: repair #237/#236/#229/#228 only; no application features or evidence-status changes.
- Latest inspected base: 9df0e66fc9899353ec00c8208c1dd070757b6bb3. Each PR adds a different root handoff; archive unchanged under docs/handoffs/issue-171.md, issue-60.md, issue-95.md, issue-84.md.
- Work remains in isolated codex-240 on task/240. Original branch repairs will use Git trees, without checking out active worker branches.
- Next: review repaired per-PR diffs, integrate candidate, run full node --test and syntax checks, push original branches, report exact SHAs and mergeability.
- #234/#235/#230 retain merge priority. Coordination posted on #240; no supplemental worker started.
- No browser, server, watcher or persistent process. Software checks do not verify scientific evidence.
