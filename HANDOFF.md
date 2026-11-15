# Issue #241

STATUS: BLOCKED: Need locations of existing f1-go.ps1 / pane-doctor.ps1 and coordinator dispatch interface to finish required reuse and enforce external repair timeouts.

- Zero-AI structured report/watch/doctor/probe commands implemented. Durable dedup; exclusive lock; two attempts per incident, four globally; 60s retry spacing; fixed read-only 2s process probe; absolute stop Nov 15 2026 06:20 PST. No dependencies added.
- Correctness follow-up: lock now covers asynchronous probe execution and logging. Regression failed before fix and passed afterward. Committed as 06867aa.
- Full `node --test`: exit 0, 1143 tests, 1056 passed, 87 TODO, zero failures. Includes malformed inputs, dedup, no-incident zero calls, budgets/deadline, lock, timeout/reaping, PowerShell syntax, real process metadata (test node PID 10444) and real CLI probe locking.
- After tests, finite watch and doctor launch through `node --test` exited 0, modelCalls=0. Direct child PIDs 10940 and 8744 confirmed exited. No persistent monitor/server started; coordinator verifies/schedules launch.
- Evidence: C:\Users\nehap\redline-conductor\state\issue-241-evidence\full-suite-followup.log, watch-followup.log, doctor-followup.log; reproducible finite-launch.test.mjs in same external evidence folder. Production state: C:\Users\nehap\redline-conductor\state\failure-watchdog-241\state.json.
- Commands/schema: scripts/failure-watchdog.md. Requests persist locally: claimed failures route owner first, then orchestrator. Actionability/ownership/resolution require coordinator inspection. External repair timeout is only a request contract; no models, messages, repairs or integration workers launched. No independent evidence identifying task 655450vvjp as hung; fixtures are synthetic.
- Next: supply upstream doctor paths and coordinator interface; integrate acknowledgment/actionable dispatch and isolated tested PR repair execution with enforced timeouts. Never touch active checkouts, credentials, worktree reset/deletion, main or evidence verification. Claude/Fable allowances unchanged; no auto submission.
- Author: akarshsharma2012 <lakshyakhandelwal28@gmail.com>, no AI trailers.
