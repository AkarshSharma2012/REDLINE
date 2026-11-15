# Issue #144

- Added standalone retrieval timing table for 1k/10k/50k synthetic rows; 10k over 200 ms sets exit code 1.
- Times the full retrieval call, excluding data generation, after a small warmup. Synthetic rows are not scientific evidence.
- Added small smoke coverage and deterministic threshold-boundary checks; no dependencies or persistent processes.
- Next: run standalone benchmark and full `node --test`, record results, commit and push.
