# Issue #245
- Actual local conductor.ps1/test-conductor.ps1 repaired and installed with backups; snapshots and detailed SHA/queue/activation receipt in tools/local-conductor/RECEIPT.md.
- Head/base retries, dedup/backoff, exclusive lock, isolated owned scratch, lossless HANDOFF-only archives, batch tests/failure isolation, race checks, separate merger logs. Source/science conflicts and tests remain mandatory; task/ui-polish excluded.
- Verification: PowerShell parse; 61 original + 10 new regressions pass (wrapper 62/62). App node --test: 1133 tests/0 fail/85 TODO. Actual seven-PR integrated tree df917b7939304c7cdd4ca94e728ab336231757a4 on base 7570c040a2b5ba550016c005a23c52413073def8: 1142 tests/0 fail/85 TODO. Installed hashes match snapshots; author corrected, no AI trailers.
- Queue before/after verify-only: 228,229,236,237,238,239,244 unchanged. No main push. Agent processes/Fable/work folders preserved. Bounded verification exited; no persistent process left.
STATUS: BLOCKED: Local repair deployed and verified; no known merger process exists to restart. Hard no-persistent-process rule prevents replacement launch; A1/operator activation command is in the receipt.
