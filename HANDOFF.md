# Issue #241

STATUS: BLOCKED: Existing coordinator needs watchdog acknowledgment/dispatch integration and bounded isolated repair execution; local requests alone cannot enforce external repair timeouts.

- Found upstream f1-go.ps1 / pane-doctor.ps1 in conductor root. Reused status/log files and last-28-lines display with bounded reads, timestamps and sanitized text; never execute their model loops or active-checkout mutations.
- Fixed malformed retry timestamps bypassing retry spacing and capped CLI probes at the absolute Nov 15 06:20 PST deadline. Intake/watch/doctor/probe use zero model calls. No new workers, dependencies, servers, credentials changes or worktree mutations.
- Targeted node --test tests/failure-watchdog.test.mjs: 13 passed, zero failures, including PowerShell parser and real read-only process evidence. First run's success-probe fixture exceeded 2s under load; fixture now uses the permitted 5s helper maximum; production probe remains 2s.
- Next: full suite once, then finite watch/doctor evidence through node --test, then push task branch. No persistent launch allowed. Coordinator verifies/schedules future passes.
- Commands/schema/limitations: scripts/failure-watchdog.md. Two requests per incident, four global, 60s spacing, owner before orchestrator, exclusive lock. No automatic repairs or external repair timeout enforcement. Never mark evidence verified or auto-submit.
- Prior handoff logs under C:\Users\nehap are historical, not evidence from this host. Current evidence will be recorded below. Task 655450vvjp has no independently established PID here; do not infer a hang or kill conductor processes.
