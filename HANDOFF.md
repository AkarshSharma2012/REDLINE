# Issue #241

- Clean assigned branch; no prior handoff. Named `f1-go.ps1` / `pane-doctor.ps1` not found under user directory; reuse remains unavailable.
- Plan: dependency-free Node structured intake, persistent dedup/budgets, exclusive lock, bounded read-only probes, owner-first escalation queue, PowerShell entry/display wrappers, synthetic tests.
- No model or repair worker launched; no checkout modifications outside this issue. Persistent monitoring launch reserved for coordinator because no process may remain after this task.
- Author verified from repository history: akarshsharma2012 <lakshyakhandelwal28@gmail.com>.
- Implemented intake, persistent dedup/retry/global budgets, owner-first local escalation requests, exclusive lock, fixed read-only timeout probe, one-shot monitoring and PowerShell wrappers. No repair/model dispatch exists; coordinator owns actionable diagnosis and isolated tested repair PRs.
- Full `node --test` run exited 1: watchdog PowerShell parser harness passed filename incorrectly. Fixed harness to pass a data-only environment variable; focused rerun pending. Windows read-only process probe passed in full run.
