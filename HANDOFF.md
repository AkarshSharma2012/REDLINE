# Issue #168

- Implemented a draft-only worksheet generator based on #82: five material IDs, stable lunar-first / ISS 21–34% O2 ordering, compact source-linked rows, blank review cells and separate deduplicated caveats.
- No evidence or review status changed. Calibrated initial/final O2 remains distinct from test O2; missing conditions remain unknown.
- Next: add regression tests, generate the sheet, run `node --test`, inspect the artifact, commit and push the task branch. No server or browser will be started.
