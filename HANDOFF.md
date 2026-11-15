# Issue #140: Missing-field audit

- Implemented deterministic row audit and per-source blank counts; flow covers speed and direction. Zero and populated uncertainty notes are not blank.
- Report retains missing provenance explicitly and includes complete rows. Inline synthetic fixtures respect file ownership.
- Next: generate report, run full Node suite, record results, push current task branch.
