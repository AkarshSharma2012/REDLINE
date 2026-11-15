# Issue #144

- Added standalone retrieval timing table for 1k/10k/50k synthetic rows; 10k over 200 ms sets exit code 1.
- Times the full retrieval call, excluding data generation, after a small warmup. Synthetic rows are not scientific evidence.
- Added small smoke coverage and deterministic threshold-boundary checks; no dependencies or persistent processes.
- Verified: `node scripts/bench-retrieve.mjs` exited 0: 1k 22.36 ms, 10k 198.70 ms, 50k 720.23 ms. 10k is close to the limit; timings depend on host load.
- Verified: full `node --test` exited 0, including three new smoke tests; existing TODO assertions remain. No server or browser started.
- No changes needed outside owned files and this required root handoff.

STATUS: DONE
