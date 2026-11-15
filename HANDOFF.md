# Issue #241

STATUS: BLOCKED: Existing coordinator needs watchdog acknowledgment/dispatch integration and bounded isolated repair execution; local requests alone cannot enforce external repair timeouts.

- Found upstream f1-go.ps1 / pane-doctor.ps1 in conductor root. Reused status/log files and last-28-lines display with bounded reads, timestamps and sanitized text; never execute their model loops or active-checkout mutations.
- Fixed malformed retry timestamps bypassing retry spacing and capped CLI probes at the absolute Nov 15 06:20 PST deadline. Intake/watch/doctor/probe use zero model calls. No new workers, dependencies, servers, credentials changes or worktree mutations.
- Targeted node --test tests/failure-watchdog.test.mjs: 13 passed, zero failures, including PowerShell parser and real read-only process evidence. First run's success-probe fixture exceeded 2s under load; fixture now uses the permitted 5s helper maximum; production probe remains 2s.
- Full node --test --test-concurrency=1: exit 0; 1145 tests, 1058 passed, 87 TODO, zero failures. After tests, finite watch/doctor via node --test passed with modelCalls=0; direct child PIDs 23916 and 28012 confirmed exited. No persistent process started. Coordinator verifies/schedules future passes.
- Commands/schema/limitations: scripts/failure-watchdog.md. Two requests per incident, four global, 60s spacing, owner before orchestrator, exclusive lock. No automatic repairs or external repair timeout enforcement. Never mark evidence verified or auto-submit.
- Prior handoff logs under C:\Users\nehap are historical, not evidence from this host. Current logs: C:\Users\Neeraj Sharma\redline-conductor\state\issue-241-evidence\full-suite.log, finite-launch.log, watch.log, doctor.log; reproducible finite-launch.test.mjs in that folder. Production state: state\failure-watchdog-241\state.json. Task 655450vvjp has no independently established PID here; do not infer a hang or kill conductor processes.

