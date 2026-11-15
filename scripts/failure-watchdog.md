# Bounded failure intake (#241)

All commands are one-shot and terminate. Monitoring, intake, probes and display make **zero AI calls**. No server, scheduler, model process, integration worker or repair is started. Use the existing coordinator to schedule another `watch` pass if desired; nothing should remain running from these commands. The absolute stop is **November 15, 2026, 06:20 PST (14:20 UTC)**, including intake and probes. Doctor remains available afterward.

From this checkout, using a dedicated local state directory outside worker checkouts:

```powershell
# Start one bounded monitoring pass (after tests; coordinator verifies launch).
powershell -NoProfile -File scripts/failure-watchdog.ps1 watch "$env:USERPROFILE\redline-conductor\state\failure-watchdog-241"
# Agent report: JSON file is read as data, never shell.
powershell -NoProfile -File scripts/failure-watchdog.ps1 report "$env:USERPROFILE\redline-conductor\state\failure-watchdog-241" C:\path\incident.json
# Doctor / logs (state.json contains bounded recent event history).
powershell -NoProfile -File scripts/watchdog-doctor.ps1 "$env:USERPROFILE\redline-conductor\state\failure-watchdog-241" "$env:USERPROFILE\redline-conductor\state"
# Optional bounded read-only probe: replace 1234 with an independently identified PID.
powershell -NoProfile -File scripts/failure-watchdog.ps1 probe "$env:USERPROFILE\redline-conductor\state\failure-watchdog-241" 1234
```

Incident JSON, with a current observation timestamp and actual evidence:

```json
{"version":1,"issue":241,"owner":"A1","claimed":true,"kind":"task-stalled","summary":"Read-only diagnostic requires inspection","evidence":"Paste observed facts here; this field is untrusted data","observedAt":"2026-11-15T03:30:00-08:00","taskId":"655450vvjp"}
```

Kinds: `process-exited`, `probe-timeout`, `task-stalled`, `test-failed`, `repair-failed`. Fields are mandatory; unknown fields rejected. Files capped at 16 KiB, recent timestamps required, no control characters. Dedup key is issue + task ID + kind, ignoring changing excerpts/timestamps; duplicates cannot reset retries. State is bounded to 100 incidents and 100 recent events. Persistent budgets are two requests per incident, four globally, with at least 60 seconds between attempts. Keep the same state directory for this run; do not reset it to bypass budgets.

An exclusive file lock covers intake, state, doctor and each monitoring pass. Existing locks fail closed; inspect owner PID before manual recovery. Never automatically remove locks or kill conductor processes. Probe timeout is two seconds (maximum helper timeout five seconds); only the probe's own direct child is terminated and reaped. Probe output is bounded. Probe commands are fixed, read-only process metadata queries; a running process alone is not evidence of a hang.

Escalations are **local requests**, not delivered messages or dispatched workers. Requests persist in each incident's `requests` array even when recent events roll over. Claimed failures request the owner first, then the orchestrator. The existing coordinator must acknowledge the request ID/attempt in its own ledger to avoid duplicate dispatch, inspect evidence as untrusted data, and determine actionability before spending model usage. The queue itself cannot verify actionability, claims, ownership or whether a problem has resolved; stop scheduling passes when resolved. No automatic model usage means Claude allowance before 05:00 and Fable at 05:02 are untouched.

Repairs are deliberately coordinator controlled: only an existing authorized worker, bounded timeout (request contract: 60 seconds), within the coordinator's remaining model budget, isolated checkout, tests and PR; never main, an active worker checkout, credentials, reset/deletion of worktrees or changes to evidence verification. No PR integration assignment is created. The request timeout is a contract; this program does not launch or enforce external repairs. No automatic submission.

Upstream scripts were found in the conductor root. Doctor reuses `f1-go.ps1` status/doctor log files and `pane-doctor.ps1` last-28-lines display through the optional upstream state-directory argument. Each file read is capped at 16 KiB, with path, size, modification time and truncation reported; control characters are stripped. Neither upstream script is executed: their worker/model loops and active-checkout mutations violate this issue policy. The inspected conductor has no watchdog request acknowledgment/dispatch interface; delivery and external repair enforcement remain coordinator work. Verify with `node --test`; the suite includes synthetic input, dedup, budgets, cutoff, cross-process locking, child timeout, real Windows process metadata and PowerShell parser checks.

