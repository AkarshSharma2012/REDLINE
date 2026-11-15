# Issue #245
- Implemented local-conductor repair snapshot: head/base retries (30s to 15m backoff), persistent failure/comment dedup, exclusive repository lock, unique owned scratch, byte-preserving HANDOFF-only archival, batch tests and isolated failing PRs. Source/science conflicts still block; tests and SHA race checks gate publication. task/ui-polish excluded.
- Regressions: Windows PowerShell parse + original offline suite 61/61, new merger suite 8/8 (real git and real node --test failure isolation); test-conductor wrapper reports 62/62.
- Queue before: 228,229,236,237,238,239,244 at main 9df0e66fc9899353ec00c8208c1dd070757b6bb3. No MergeOnly process found; preserve A1/agent processes and Fable. No persistent process started.
- Next: deploy snapshots to actual local conductor with backups, one-shot verify-only integration with SHA/queue receipts, final application node --test, push this issue branch only.
