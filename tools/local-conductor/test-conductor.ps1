# Regression tests for conductor.ps1. Every test replays a real failure from the first night.
# Runs offline: GitHub is mocked, git runs against throwaway local repos. Does not touch the real queue or running agents.
# Usage: powershell -ExecutionPolicy Bypass -File .\test-conductor.ps1
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $here "conductor.ps1"
$pass = 0; $fail = 0
function Check($name, [scriptblock]$test) {
    try { $ok = & $test } catch { $ok = $false; $err = "$_" }
    if ($ok) { $script:pass++; Write-Host "PASS  $name" -ForegroundColor Green }
    else { $script:fail++; Write-Host "FAIL  $name $err" -ForegroundColor Red }
}

# --- load the conductor's functions without running its main loop ---
$tokens = $null; $perr = $null
$ast = [System.Management.Automation.Language.Parser]::ParseFile($script, [ref]$tokens, [ref]$perr)
Check "script parses in Windows PowerShell 5.1 with no errors" { $perr.Count -eq 0 }
$funcs = $ast.FindAll({ $args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst] }, $false)
foreach ($f in $funcs) { . ([scriptblock]::Create($f.Extent.Text)) }
$tmp = Join-Path $env:TEMP "conductor-tests-$(Get-Random)"; New-Item -ItemType Directory $tmp | Out-Null
$Repo = "test/repo"; $Agent = "codex"; $who = "TEST/codex"; $StaleMinutes = 30; $state = $tmp

# --- Backup worker (B2-1) takes over only when the main Claude (B2) is out of usage or silent ---
function C($body, $mins) { [pscustomobject]@{ body = $body; updated_at = (Get-Date).ToUniversalTime().AddMinutes(-$mins).ToString("o") } }
Check "standby: peer worked 2 minutes ago -> backup stays idle" { -not (Test-PeerDown "LAPTOP-AM/claude" @((C "conductor-claim: LAPTOP-AM/claude heartbeat 2026-11-14T12:00:00" 2))) }
Check "standby: peer said 'out of usage' -> backup takes over right away" { Test-PeerDown "LAPTOP-AM/claude" @((C "LAPTOP-AM/claude: out of usage; progress saved on branch task/1-x, back in the queue" 1)) }
Check "standby: peer silent for 30 minutes -> backup takes over" { Test-PeerDown "LAPTOP-AM/claude" @((C "LAPTOP-AM/claude: done, PR: x" 30)) }
Check "standby: peer claims again after its reset -> backup yields" { -not (Test-PeerDown "LAPTOP-AM/claude" @((C "conductor-claim: LAPTOP-AM/claude heartbeat now" 0), (C "LAPTOP-AM/claude: out of usage; back in the queue" 40))) }
Check "standby: another agent's comments do not count as the peer" { Test-PeerDown "LAPTOP-AM/claude" @((C "conductor-claim: LAPTOP-AM/codex heartbeat now" 0)) }
Check "standby: peer never seen -> backup works" { Test-PeerDown "LAPTOP-AM/claude" @() }


# --- Bug 1-3: stderr from git/agents crashed the script; real git failures were hidden ---
Check "a program that prints to stderr and exits 0 does not crash (git 'remote:' / Codex banner bug)" {
    $r = Invoke-Native "cmd.exe" @("/c", "echo normal output & echo remote: Create a pull request 1>&2 & exit 0")
    ($r.Code -eq 0) -and ($r.Out -join "") -match "normal output" -and $r.Err -match "remote:"
}
Check "git writing hints/warnings to stderr with exit 0 does not crash (git 'remote:' / 'Everything up-to-date' bug)" {
    $clone = Join-Path $tmp "clone"
    git init -q $clone
    $r = Invoke-Native "git.exe" @("-C", $clone, "checkout", "-b", "task/1-test")   # git says "Switched to a new branch" on stderr, exit 0
    git -C $clone checkout -b task/2-test                                           # same, through the conductor's git wrapper
    ($r.Code -eq 0) -and ($r.Err -match "Switched")
}
Check "a real git failure stops with its actual message (hidden-failure bug)" {
    try { git -C (Join-Path $tmp "does-not-exist") status; $false } catch { "$_" -match "failed" -and "$_" -match "git" }
}
Check "removing a worktree that is not there is tolerated" {
    git -C (Join-Path $tmp "clone") worktree remove --force (Join-Path $tmp "nope"); $true
}

# --- Bug 4: two agents cloned into the same folder at once ---
Check "each agent gets its own repo copy (concurrent clone bug)" {
    (Get-Content $script -Raw) -match '\$base = Join-Path \$root "repo-\$Agent"'
}

# --- mocked GitHub for queue tests ---
$global:MockIssues = @{}; $global:MockComments = @{}; $global:MockOpen = "[]"
function Invoke-Gh {
    $a = @($args)
    if ($a[0] -eq "issue" -and $a[1] -eq "list" -and ($a -notcontains "--label")) { return $global:MockOpen }
    if ($a[0] -eq "issue" -and $a[1] -eq "list") { $q = $a[[array]::IndexOf($a, "--label") + 1]; if ($global:MockIssues.ContainsKey($q)) { return $global:MockIssues[$q] } else { return "[]" } }
    if ($a[0] -eq "api" -and $a[1] -match 'issues/(\d+)/comments') { $n = [int]$matches[1]; if ($global:MockComments.ContainsKey($n)) { return $global:MockComments[$n] } else { return "[]" } }
    throw "unexpected gh call: $($a -join ' ')"
}
function Issue($n, $labels) { @{ number = $n; title = "t$n"; body = ""; labels = @($labels | ForEach-Object { @{ name = $_ } }) } }
function J($o) { ConvertTo-Json @($o) -Depth 5 -Compress }
$now = (Get-Date).ToUniversalTime()
function Claim-Comment($mins) { @{ id = 1; body = "conductor-claim: X heartbeat"; created_at = $now.AddMinutes(-$mins).ToString("o"); updated_at = $now.AddMinutes(-$mins).ToString("o") } }

# --- Bug 5: PowerShell 5.1 passed the JSON list as one object -> wrong order, and Claude's two queues broke ---
Check "Codex picks the OLDEST ready task when several are queued (reverse-order bug)" {
    $global:MockIssues = @{ "ready" = (J @((Issue 33 "ready"), (Issue 19 "ready"), (Issue 27 "ready"))) }
    $Agent = "codex"; (Find-Task).number -eq 19
}
Check "Claude takes ready-claude first, oldest first (two-queue bug)" {
    $global:MockIssues = @{ "ready-claude" = (J @((Issue 29 "ready-claude"), (Issue 22 "ready-claude"))); "ready" = (J @((Issue 19 "ready"))) }
    $Agent = "claude"; (Find-Task).number -eq 22
}
Check "Claude never takes plain ready tasks (saves Claude usage; Codex does the busywork)" {
    $global:MockIssues = @{ "ready" = (J @((Issue 28 "ready"), (Issue 21 "ready"))) }
    $Agent = "claude"; $null -eq (Find-Task)
}
Check "Codex never takes Claude-only tasks" {
    $global:MockIssues = @{ "ready-claude" = (J @((Issue 22 "ready-claude"))) }
    $Agent = "codex"; $null -eq (Find-Task)
}
Check "a single queued task still works (one-item list)" {
    $global:MockIssues = @{ "ready" = (J @((Issue 11 "ready"))) }
    $Agent = "codex"; (Find-Task).number -eq 11
}
Check "skips blocked tasks and tasks with a live claim" {
    $global:MockIssues = @{ "ready" = (J @((Issue 20 @("ready", "claimed")), (Issue 21 @("ready", "blocked")), (Issue 23 "ready"))) }
    $global:MockComments = @{ 20 = (J @((Claim-Comment 5))) }
    $Agent = "codex"; (Find-Task).number -eq 23
}
Check "takes over a stale claim (agent's PC died / restarted)" {
    $global:MockIssues = @{ "ready" = (J @((Issue 20 @("ready", "claimed")), (Issue 23 "ready"))) }
    $global:MockComments = @{ 20 = (J @((Claim-Comment 95))) }
    $Agent = "codex"; (Find-Task).number -eq 20
}

# --- Order: dependencies first (chronological), then priority, then issue number ---
function IssueB($n, $labels, $body) { @{ number = $n; title = "t$n"; body = $body; labels = @($labels | ForEach-Object { @{ name = $_ } }) } }
Check "a task whose 'Depends on:' issue is still open is skipped, even with the priority label" {
    $global:MockIssues = @{ "ready" = (J @((IssueB 30 @("ready", "priority") "Depends on: #12`n`nbody"), (Issue 31 "ready"))) }
    $global:MockOpen = (J @(@{ number = 12 }, @{ number = 30 }, @{ number = 31 })); $global:MockComments = @{}
    $Agent = "codex"; (Find-Task).number -eq 31
}
Check "once the dependency is merged and closed, the task becomes available" {
    $global:MockIssues = @{ "ready" = (J @((IssueB 30 @("ready", "priority") "Depends on: #12"), (Issue 31 "ready"))) }
    $global:MockOpen = (J @(@{ number = 30 }, @{ number = 31 }))
    $Agent = "codex"; (Find-Task).number -eq 30
}
Check "among tasks with no open dependencies, priority goes first, then issue number" {
    $global:MockIssues = @{ "ready" = (J @((Issue 20 "ready"), (IssueB 40 @("ready", "priority") "Depends on: #5"), (Issue 41 @("ready", "priority")))) }
    $global:MockOpen = (J @(@{ number = 20 }, @{ number = 40 }, @{ number = 41 }, @{ number = 5 }))
    $Agent = "codex"; (Find-Task).number -eq 41
}
Check "a task depending on several issues waits until all are closed" {
    $global:MockIssues = @{ "ready" = (J @((IssueB 50 "ready" "Depends on: #1, #2, #3"))) }
    $global:MockOpen = (J @(@{ number = 3 }, @{ number = 50 }))
    $Agent = "codex"; $null -eq (Find-Task)
}
$global:MockOpen = "[]"
# --- Bug 6/7: HANDOFF.md in the wrong folder; bullet-style STATUS line ---
function NewTree($files) { $d = Join-Path $tmp "wt-$(Get-Random)"; New-Item -ItemType Directory $d | Out-Null; foreach ($k in $files.Keys) { $p = Join-Path $d $k; New-Item -ItemType Directory (Split-Path $p) -Force | Out-Null; Set-Content $p $files[$k] }; $d }
function StatusOf($d) { $s = Get-HandoffStatus $d; if ($s) { $s.Matches[0].Groups[1].Value } else { "none" } }
Check "DONE in root HANDOFF.md is detected" { (StatusOf (NewTree @{ "HANDOFF.md" = "notes`nSTATUS: DONE" })) -eq "DONE" }
Check "DONE in docs/HANDOFF.md is detected (Lakshya's 50-loop bug)" { (StatusOf (NewTree @{ "docs\HANDOFF.md" = "STATUS: DONE" })) -eq "DONE" }
Check "DONE in research/HANDOFF.md is detected" { (StatusOf (NewTree @{ "research\HANDOFF.md" = "STATUS: DONE" })) -eq "DONE" }
Check "bullet-style '- STATUS: DONE' is detected" { (StatusOf (NewTree @{ "HANDOFF.md" = "- STATUS: DONE remains applicable." })) -eq "DONE" }
Check "BLOCKED keeps its reason" { (StatusOf (NewTree @{ "HANDOFF.md" = "STATUS: BLOCKED: need login" })) -eq "BLOCKED: need login" }
Check "the last STATUS line wins" { (StatusOf (NewTree @{ "HANDOFF.md" = "STATUS: BLOCKED: x`nlater`nSTATUS: DONE" })) -eq "DONE" }
Check "no HANDOFF.md means not done" { (StatusOf (NewTree @{ "research\notes.md" = "hello" })) -eq "none" }
Check "a HANDOFF.md without a STATUS line means not done" { (StatusOf (NewTree @{ "HANDOFF.md" = "working on it" })) -eq "none" }
Check "a word like 'STATUS: DONE' mid-sentence does not count" { (StatusOf (NewTree @{ "HANDOFF.md" = "we will write STATUS: DONE later" })) -eq "none" }

# --- Bug 8: no retry limit -> same task 50 times ---
function Stop-Comments($k) { J @(1..([Math]::Max($k, 1)) | ForEach-Object { @{ id = $_; body = "TEST: stopped before finishing; progress saved" } } | Select-Object -First $k) }
Check "loop guard: 0 prior stops -> retry allowed" { $global:MockComments = @{ 40 = "[]" }; (Get-PriorStops 40) -lt 2 }
Check "loop guard: 1 prior stop -> retry allowed" { $global:MockComments = @{ 40 = (Stop-Comments 1) }; (Get-PriorStops 40) -eq 1 }
Check "loop guard: 2 prior stops -> blocked" { $global:MockComments = @{ 40 = (Stop-Comments 2) }; (Get-PriorStops 40) -ge 2 }
Check "loop guard: 50 prior stops -> blocked" { $global:MockComments = @{ 40 = (Stop-Comments 50) }; (Get-PriorStops 40) -eq 50 }
Check "main loop really uses the loop guard and the HANDOFF finder" {
    $t = Get-Content $script -Raw; ($t -match 'Get-PriorStops \$i\.number') -and ($t -match 'if \(\$prior -ge 2\)') -and ($t -match 'Get-HandoffStatus \$wt\.Path')
}

# --- Bug 10: a finished task picked up twice crashed on "a pull request already exists" ---
function Invoke-Gh {
    $a = @($args)
    if ($a[0] -eq "pr" -and $a[1] -eq "create") { if ($global:PrExists) { throw "gh pr create failed: a pull request for branch ""x"" into branch ""main"" already exists" } else { return "https://github.com/test/repo/pull/7" } }
    if ($a[0] -eq "pr" -and $a[1] -eq "list") { return "https://github.com/test/repo/pull/5" }
    throw "unexpected gh call: $($a -join ' ')"
}
$fakeIssue = @{ number = 26; title = "S1" }
Check "new PR is created normally" { $global:PrExists = $false; (New-PullRequest $fakeIssue "task/26-x") -eq "https://github.com/test/repo/pull/7" }
Check "an existing PR is reused instead of crashing (duplicate-pickup bug)" { $global:PrExists = $true; (New-PullRequest $fakeIssue "task/26-x") -eq "https://github.com/test/repo/pull/5" }
Check "main loop opens PRs through New-PullRequest" { (Get-Content $script -Raw) -match '\$pr = New-PullRequest \$i \$wt\.Branch' }

# --- Bug 11: a stale usage reading (reset time already passed) caused an endless 'cooling down until <past time>' ---
$cooldownFile = Join-Path $tmp "codex.cooldown"; $Agent = "codex"; $Reserve = 5
function Limits($pct, $minutesFromNow) { @{ primary = @{ used_percent = $pct; resets_at = [DateTimeOffset]::UtcNow.AddMinutes($minutesFromNow).ToUnixTimeSeconds() }; secondary = $null } }
Check "stale reading (99% used, reset 3 hours ago) does NOT block work (Lakshya's 6:53 bug)" {
    function Get-CodexLimits { Limits 99 -180 }; Remove-Item $cooldownFile -ErrorAction SilentlyContinue; (Test-Available) -and -not (Test-Path $cooldownFile)
}
Check "real limit (99% used, resets in 2 hours) DOES cool down, until a future time" {
    function Get-CodexLimits { Limits 99 120 }; Remove-Item $cooldownFile -ErrorAction SilentlyContinue
    $ok = -not (Test-Available); $until = [datetime](Get-Content $cooldownFile); $ok -and ($until -gt (Get-Date))
}
Check "plenty left (40% used) works normally" {
    function Get-CodexLimits { Limits 40 120 }; Remove-Item $cooldownFile -ErrorAction SilentlyContinue; Test-Available
}
Check "an expired cooldown file is cleared and work resumes" {
    function Get-CodexLimits { $null }; Set-Content $cooldownFile (Get-Date).AddMinutes(-5).ToString("o"); (Test-Available) -and -not (Test-Path $cooldownFile)
}
Check "no usage data at all does not block work" {
    function Get-CodexLimits { $null }; Remove-Item $cooldownFile -ErrorAction SilentlyContinue; Test-Available
}

# --- Bug 12: Claude's "You've hit your session limit · resets 12:30pm" was not recognised, so it hopped task to task ---
$limitPattern = ((Get-Content $script -Raw) -split "`n" | Where-Object { $_ -match '^\$limitPattern\s*=' } | Select-Object -First 1) -replace '^\$limitPattern\s*=\s*"(.*)".*$', '$1'
Check "recognises Claude's 'hit your session limit' (B1 task-hopping bug)" { "You've hit your session limit · resets 12:30pm (America/Los_Angeles)" -match $limitPattern }
Check "recognises Claude's weekly limit" { "You've hit your weekly limit · resets Wed 7pm" -match $limitPattern }
Check "recognises Codex's usage limit" { "You've hit your usage limit. Try again later." -match $limitPattern }
Check "does not mistake normal output for a limit" { -not ("Issue #50 is finished and pushed; all 4 tests pass." -match $limitPattern) }
$nine = [datetime]'2026-11-14 09:21'
Check "cooldown runs until the time Claude says (12:30pm -> 12:32)" { (Get-LimitReset "session limit · resets 12:30pm" $nine) -eq [datetime]'2026-11-14 12:32' }
Check "a reset time earlier than now means tomorrow" { (Get-LimitReset "resets 8am" $nine) -eq [datetime]'2026-11-15 08:02' }
Check "no reset time in the message -> 60 minutes" { (Get-LimitReset "usage limit" $nine) -eq $nine.AddMinutes(60) }

# --- Auto-merge safety: only ever merge when the merge is clean AND every test passes ---
Check "auto-merge: clean merge + tests pass -> merge" { (Get-MergeDecision $true $true) -eq "merge" }
Check "auto-merge: tests fail -> do NOT merge" { (Get-MergeDecision $true $false) -eq "tests-failed" }
Check "auto-merge: conflict -> do NOT merge" { (Get-MergeDecision $false $false) -eq "conflict" }
Check "auto-merge only pushes inside the 'merge' decision" {
    $t = Get-Content $script -Raw; ([regex]::Matches($t, 'push -q origin HEAD:main')).Count -eq 2 -and $t -match '"merge" \{\s*\r?\n\s*git -C \$m push -q origin HEAD:main' -and $t -match 'if \(\$testsOk\) \{\s*\r?\n\s*git -C \$m push -q origin HEAD:main'
}
Check "auto-merge runs the tests before deciding" { (Get-Content $script -Raw) -match 'Invoke-Native "node" @\("--test"\)' }

# --- Bug 9: a crash left a dead claim, so nobody could take the task for 30 minutes ---
Check "a crash releases the claim instead of leaving it behind" { (Get-Content $script -Raw) -match 'catch \{[\s\S]*?if \(\$i -and \$claim\) \{ try \{ Release' }

# --- Effort follows the task: light tasks cheap, heavy tasks stronger; switches back by itself ---
Check "heavy task runs at -HeavyEffort, light task at -CodexEffort" {
    $script:CodexEffort = "low"; $script:HeavyEffort = "medium"
    $h = (Get-CodexArgs @{ title = "W1: wire it" } "p") -join " "; $l = (Get-CodexArgs @{ title = "S: lint script" } "p") -join " "
    $h -match "model_reasoning_effort=medium" -and $l -match "model_reasoning_effort=low"
}
Check "without -HeavyEffort every task uses -CodexEffort (old behaviour)" {
    $script:CodexEffort = "low"; $script:HeavyEffort = ""
    ((Get-CodexArgs @{ title = "W1: wire it" } "p") -join " ") -match "model_reasoning_effort=low"
}
$script:CodexEffort = ""; $script:HeavyEffort = ""
# --- Fast crashes (login expired, unrecognised usage message) must not burn tasks through the loop guard ---
Check "a crash within 2 minutes shows its reason, pauses, and does not count as a strike or block the task" {
    $s = Get-Content $script -Raw
    $s -match 'agent failed fast' -and $s -match '\$fastFail = \(\$script:lastExit -ne 0 -and \$script:lastSeconds -lt 120\)' -and $s -match 'elseif \(-not \$fastFail\) \{ Release' -and $s -match 'Set-Cooldown \(Get-Date\)\.AddMinutes\(10\)'
}
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "`n$pass passed, $fail failed" -ForegroundColor $(if ($fail) { "Red" } else { "Green" })
exit $fail
