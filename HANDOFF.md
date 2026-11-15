# Issue #245
- Confirmed historical skip comments permanently exclude repaired heads; shared merge scratch and root HANDOFF collisions prevent batching.
- Current queue: 228,229,236,237,238,239,244; main 9df0e66fc9899353ec00c8208c1dd070757b6bb3. Repair snapshots will live in tools/local-conductor and be applied to the actual local scripts after verification.
- No known MergeOnly process exists. Preserve agent processes and scheduled Fable; use bounded one-shot operation, no persistent process.
- Next: implement SHA retries, owned scratch/lock, lossless handoff archives, failure isolation; regressions and full node --test.
