# Issue #144

- Added standalone retrieval timing table for 1k/10k/50k synthetic rows; 10k over 200 ms sets exit code 1.
- Times the full retrieval call, excluding data generation, after a small warmup. Synthetic rows are not scientific evidence.
- Added small smoke coverage and deterministic threshold-boundary checks; no dependencies or persistent processes.
- Verified: `node scripts/bench-retrieve.mjs` exited 0: 1k 21.17 ms, 10k 159.48 ms, 50k 805.41 ms. Timings depend on host load.
- Verified: full `node --test` exited 0, including three new smoke tests; existing TODO assertions remain. No server or browser started.
- No changes needed outside owned files and this required root handoff.

STATUS: DONE

