# REDLINE conductor: one copy per agent. Takes GitHub issues labeled "ready", works each one
# on its own branch, opens a PR when done, and releases the task if the agent stops.
# Usage:  .\conductor.ps1 -Agent codex      (second window:  .\conductor.ps1 -Agent claude)
param(
    [Parameter(Mandatory)][ValidateSet("codex", "claude")][string]$Agent,
    [string]$Repo = "AkarshSharma2012/REDLINE",
    [int]$Reserve = 5,
[string]$Model = "",          # Claude only: e.g. claude-opus-5-5
[string]$Effort = "",         # Claude only: low|medium|high
[string]$StandbyFor = "",     # backup worker: only work while this peer (e.g. LAPTOP-AM/claude) is out of usage or silent for 10 min
[string]$StopAt = "",          # stop for good at this clock time today, e.g. 17:40
[int]$PaceMinutes = 0,        # after each finished task, rest this many minutes (spreads usage out; never sleeps past -StopAt)
[int]$MaxTasks = 0,         # stop after this many tasks (0 = no cap); use it to cap a backup worker
[string]$CodexEffort = "",     # Codex only: low|medium|high reasoning effort (lower = cheaper)
[string]$HeavyEffort = "",     # Codex only: reasoning effort for heavy tasks (e.g. medium or high); light tasks keep -CodexEffort, so effort drops back by itself when light tasks return
[string]$Prefer = "",           # Codex only: "light" or "heavy": take that class of task first (heavy = R:/V:/W:/X:/F:/Q:/B:/M:/J: titles)
[switch]$OnlyPreferred,       # with -Prefer: never take the other class
          # keep this % of Codex usage free (friend can raise it)
    [int]$StaleMinutes = 30,    # a claim with no heartbeat this long goes back in the queue
    [switch]$Once,              # handle at most one task, then exit
    [switch]$DryRun,            # claim and release without running the agent (for testing)
    [switch]$AutoMerge,         # while idle, merge finished task PRs whose merged result passes `node --test` (no AI usage)
    [switch]$MergeOnly,  # run ONLY the auto-merge loop every 2 minutes (no agent, no AI usage)
[switch]$ClaudeFullAccess   # Claude only: skip permission prompts (same idea as Codex full access); use on your own machine only
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$base = Join-Path $root "repo-$Agent"   # one repo copy per agent, so two agents never clone into the same folder at once
$work = Join-Path $root "work"; $state = Join-Path $root "state"
New-Item -ItemType Directory $work, $state -Force | Out-Null
$who = "$env:COMPUTERNAME/$Agent"
$cooldownFile = Join-Path $state "$Agent.cooldown"
# Codex: "usage limit", "rate limit"; Claude: "You've hit your session limit · resets 12:30pm", "weekly limit", "hit your limit".
$limitPattern = "usage limit|rate limit|hit your (\w+ )?limit|session limit|weekly limit|limit reached|quota exceeded"

function Log($m) { $l = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$who] $m"; Write-Host $l; Add-Content (Join-Path $state "$Agent.log") $l }
# Windows PowerShell 5.1 turns ANY stderr line from a native program into a fatal error when ErrorActionPreference is Stop,
# but git, gh and the agents print normal progress on stderr. So: run them with a local Continue, keep stderr separately,
# and fail only on a real non-zero exit code, with the real message.
function Invoke-Native($exe, $argv) {
    $ErrorActionPreference = "Continue"
    $all = & $exe @argv 2>&1
    $code = $LASTEXITCODE
    $out = @($all | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] } | ForEach-Object { "$_" })
    $err = (@($all | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] } | ForEach-Object { "$_" }) -join " ").Trim()
    return @{ Code = $code; Out = $out; Err = $err }
}
function Invoke-Gh { $r = Invoke-Native "gh.exe" $args; if ($r.Code -ne 0) { throw "gh $($args[0..1] -join ' ') failed: $($r.Err) $($r.Out -join ' ')" }; $r.Out }
function git {
    $r = Invoke-Native "git.exe" $args
    $tolerated = ($args -contains "worktree" -and $args -contains "remove")   # removing a missing worktree is fine
    if ($r.Code -ne 0 -and -not $tolerated) { throw "git $($args | Where-Object { $_ -notlike '*\*' } | Select-Object -First 3) failed: $($r.Err)" }
    $r.Out
}

function Get-CodexLimits {
    $f = Get-ChildItem "$env:USERPROFILE\.codex\sessions" -Recurse -Filter *.jsonl -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if (-not $f) { return $null }
    $line = Get-Content $f.FullName | Where-Object { $_ -match '"rate_limits"' } | Select-Object -Last 1
    if ($line) { ($line | ConvertFrom-Json).payload.rate_limits } else { $null }
}
function Set-Cooldown([datetime]$until) { Set-Content $cooldownFile $until.ToString("o"); Log "cooling down until $until" }
function Get-RecentComments {
    try { $raw = gh api "repos/$Repo/issues/comments?sort=updated&direction=desc&per_page=100"; $c = $raw | ConvertFrom-Json; return $c | ForEach-Object { $_ } } catch { return $null }
}
# True when the peer agent is out of usage, or has posted nothing for 10 minutes. Newest peer comment wins.
function Test-PeerDown($peer, $comments) {
    $esc = [regex]::Escape($peer)
    $mine = $comments | Where-Object { $_.body -match "^(conductor-claim: )?$esc\b" } | Select-Object -First 1
    if (-not $mine) { return $true }
    if ($mine.body -match "out of usage") { return $true }
    return (((Get-Date).ToUniversalTime() - ([datetime]$mine.updated_at).ToUniversalTime()).TotalMinutes -gt 10)
}
function Test-Available {
    if (Test-Path $cooldownFile) {
        $until = [datetime](Get-Content $cooldownFile)
        if ((Get-Date) -lt $until) { return $false }
        Remove-Item $cooldownFile
    }
    if ($Agent -eq "codex") {
        $rl = Get-CodexLimits
        foreach ($w in @($rl.primary, $rl.secondary)) {
            if (-not ($w -and $w.resets_at)) { continue }
            $resets = [DateTimeOffset]::FromUnixTimeSeconds([long]$w.resets_at).LocalDateTime
            # A reading whose reset time has already passed is stale (the window has refilled since): ignore it.
            if ($resets -le (Get-Date)) { continue }
            if ($w.used_percent -ge (100 - $Reserve)) { Set-Cooldown $resets.AddMinutes(2); return $false }
        }
    }
    return $true
}

function Remove-Comment($id) { try { Invoke-Gh api -X DELETE "repos/$Repo/issues/comments/$id" | Out-Null } catch { } }   # already gone is fine
function Get-Claims($n) {
    $c = Invoke-Gh api "repos/$Repo/issues/$n/comments" --paginate | ConvertFrom-Json
    $c | Where-Object { $_.body -like "conductor-claim:*" }
}
function Test-Stale($claim) { ((Get-Date).ToUniversalTime() - ([datetime]$claim.updated_at).ToUniversalTime()).TotalMinutes -gt $StaleMinutes }

# light = tests, scripts, docs, audits; heavy = evidence extraction/verification, UI and engine work.
function Get-TaskClass($title) { if ($title -match '^(R|V|W|X|F|Q|B|M|J)\d*:') { "heavy" } else { "light" } }
function Get-OpenDeps($body, $openNums) {
    # A "Depends on: #12, #15" line in the issue body means: wait until those issues are merged and closed. Returns the ones still open.
    $deps = @()
    foreach ($ln in ([string]$body -split "`n")) { if ($ln -match '^\s*Depends on:\s*(.*)$') { $deps += @([regex]::Matches($matches[1], '#(\d+)') | ForEach-Object { [int]$_.Groups[1].Value }) } }
    @($deps | Where-Object { $openNums -contains $_ })
}
function Find-Task {
    # Claude takes "ready-claude" (hard tasks) first, then helps with "ready". Codex only takes "ready".
    $queues = if ($Agent -eq "claude") { @("ready-claude") } else { @("ready") }   # Claude only takes tasks labelled ready-claude (heavy analysis); everything labelled ready is Codex-only, to save Claude usage
    # PowerShell 5.1's ConvertFrom-Json emits a JSON array as ONE object, so store it first and then pipe it (that unrolls it).
    $issues = foreach ($q in $queues) { $list = Invoke-Gh issue list -R $Repo --label $q --state open --json "number,title,body,labels" --limit 50 | ConvertFrom-Json; $list | Sort-Object number }
    $openNums = @((Invoke-Gh issue list -R $Repo --state open --json number --limit 300 | ConvertFrom-Json) | ForEach-Object { [int]$_.number })   # order: dependencies first (chronological), then priority, then issue number
    $issues = @($issues | Where-Object { @(Get-OpenDeps $_.body $openNums).Count -eq 0 })   # never start a task whose "Depends on:" issues are not merged yet
    $issues = @($issues | Sort-Object @{ Expression = { if ($_.labels.name -contains 'priority') { 0 } else { 1 } } }, number)   # issues labelled priority go first
    if ($Prefer) { $issues = @($issues | Where-Object { (Get-TaskClass $_.title) -eq $Prefer }) + $(if ($OnlyPreferred) { @() } else { @($issues | Where-Object { (Get-TaskClass $_.title) -ne $Prefer }) }) }
    foreach ($i in $issues) {
        $labels = $i.labels.name
        if ($labels -contains "blocked") { continue }
        if ($labels -contains "claimed") {
            $live = Get-Claims $i.number | Where-Object { -not (Test-Stale $_) }
            if ($live) { continue }
            Log "issue #$($i.number) claim went stale; taking it over"
        }
        return $i
    }
    return $null
}
function Claim($i) {
    $me = Invoke-Gh api "repos/$Repo/issues/$($i.number)/comments" -f body="conductor-claim: $who heartbeat $(Get-Date -Format o)" | ConvertFrom-Json
    Invoke-Gh issue edit $i.number -R $Repo --add-label claimed | Out-Null
    Start-Sleep 3
    $first = Get-Claims $i.number | Where-Object { -not (Test-Stale $_) -or $_.id -eq $me.id } | Sort-Object { [datetime]$_.created_at }, id | Select-Object -First 1
    if ($first.id -ne $me.id) { Remove-Comment $me.id; Log "lost the race for #$($i.number)"; return $null }
    foreach ($old in (Get-Claims $i.number | Where-Object { $_.id -ne $me.id })) { Remove-Comment $old.id }
    return $me
}
function Release($i, $claim, $reason, [switch]$Done, [switch]$Blocked) {
    $args2 = @("issue", "edit", $i.number, "-R", $Repo, "--remove-label", "claimed")
    if ($Done) { $args2 += @("--remove-label", "ready", "--remove-label", "ready-claude", "--add-label", "review") }
    if ($Blocked) { $args2 += @("--add-label", "blocked") }
    Invoke-Gh @args2 | Out-Null
    if ($claim) { Remove-Comment $claim.id }
    Invoke-Gh issue comment $i.number -R $Repo --body "${who}: $reason" | Out-Null
    Log "#$($i.number): $reason"
}

function Prepare-Worktree($i) {
    if (-not (Test-Path (Join-Path $base ".git"))) {
        if (Test-Path $base) { Remove-Item $base -Recurse -Force }   # leftover from an interrupted clone
        Log "downloading the repo (first run can take a minute)"
        git clone -q "https://github.com/$Repo.git" $base
    }
    git -C $base fetch -q --prune origin
    $slug = ($i.title.ToLower() -replace '[^a-z0-9]+', '-').Trim('-'); if ($slug.Length -gt 40) { $slug = $slug.Substring(0, 40).Trim('-') }
    $branch = "task/$($i.number)-$slug"
    $wt = Join-Path $work "$Agent-$($i.number)"
    if (Test-Path $wt) { git -C $base worktree remove --force $wt; Remove-Item $wt -Recurse -Force -ErrorAction SilentlyContinue }
    git -C $base worktree prune
    $remote = git -C $base ls-remote --heads origin $branch
    if ($remote) { git -C $base worktree add -q -B $branch $wt "origin/$branch" }     # resume someone's saved progress
    else { git -C $base worktree add -q -B $branch $wt origin/main }
    git -C $wt push -q -u origin $branch
    return @{ Path = $wt; Branch = $branch }
}

# Codex arguments: web search only for research/verification tasks (R:/V:), optional lower reasoning effort to save usage.
function Get-CodexArgs($i, $prompt) {
    $cx = @()
    if ($i.title -match '^(R|V)\d*:') { $cx += "--search" }
    $eff = if ($HeavyEffort -and (Get-TaskClass $i.title) -eq "heavy") { $HeavyEffort } else { $CodexEffort }
    if ($eff) { $cx += @("-c", "model_reasoning_effort=$eff") }
    $cx + @("exec", "--dangerously-bypass-approvals-and-sandbox", $prompt)
}
function Run-Agent($i, $wt) {
    $prompt = "You are one of several AI agents building REDLINE (NASA Space Apps 2026). Your task is GitHub issue #$($i.number) in $Repo. " +
              "Title: $($i.title). Details: $($i.body) " + "HARD RULE: never start a web server or any process that keeps running after you finish (no http.server, no dev server, no browser); verify with node --test only, because a leftover process freezes the conductor. " +
              "Rules: work only on this issue, in this folder, on the current git branch; never push to main. Read HANDOFF.md first if it exists: another agent may have started this task. " +
              "After every meaningful step, commit your work (pushing is optional: the conductor pushes when you stop). Keep HANDOFF.md updated with what is done, what is next, and key decisions. " +
              "USAGE RULE: be economical with tokens. Read only AGENTS.md and the files this task owns or names; skip the long Read-first list unless the task touches the UI, the engine or science wording. Search the web only if the task needs a source. Run the full test suite once at the end, not after every edit. Keep HANDOFF.md short. "+
              "When the issue is fully done and verified, put the line STATUS: DONE in HANDOFF.md and push. If you are blocked and need a human, put STATUS: BLOCKED: <reason> and push."
    # Windows PowerShell mangles double quotes in arguments to native programs; keep the prompt one clean line.
    $prompt = ($prompt -replace '"', "'") -replace '\s*\r?\n\s*', ' '
    Push-Location $wt.Path
    try {
        $script:agentStart = Get-Date; Log "agent running (output goes to state\$Agent.log when it stops)"
        $r = if ($Agent -eq "codex") { Invoke-Native "codex" (Get-CodexArgs $i $prompt) } else { Invoke-Native "claude" (@("-p", $prompt) + $(if ($ClaudeFullAccess) { @("--dangerously-skip-permissions") } else { @() }) + $(if ($Model) { @("--model", $Model) } else { @() }) + $(if ($Effort) { @("--effort", $Effort) } else { @() })) }
        $script:lastExit = $r.Code; $script:lastSeconds = [int]((Get-Date) - $script:agentStart).TotalSeconds; Log "agent stopped (exit code $($r.Code))"
        (($r.Out -join "`n") + "`n" + $r.Err)
    } finally { Pop-Location }
}

# Finds the agent's HANDOFF.md (repo root first; agents sometimes put it inside research/ or docs/) and returns the last STATUS line match.
function Get-HandoffStatus($path) {
    $handoff = Join-Path $path "HANDOFF.md"
    if (-not (Test-Path $handoff)) {
        $nested = Get-ChildItem $path -Recurse -Filter HANDOFF.md -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\\.git\\' } | Select-Object -First 1
        if ($nested) { $handoff = $nested.FullName } else { return $null }
    }
    Select-String -Path $handoff -Pattern '^\s*[-*]?\s*STATUS: (DONE|BLOCKED.*)' | Select-Object -Last 1
}
# Opens the PR for a finished task; if one already exists for the branch (task picked up twice), reuse it instead of failing.
function New-PullRequest($i, $branch) {
    try { Invoke-Gh pr create -R $Repo --base main --head $branch --title "#$($i.number) $($i.title)" --body "Closes #$($i.number). Built by $who via the REDLINE conductor." }
    catch {
        if ("$_" -notmatch "already exists") { throw }
        Invoke-Gh pr list -R $Repo --head $branch --state all --json url --jq ".[0].url"
    }
}
# When an agent says it is out of usage, read "resets 12:30pm" from its message; fall back to 60 minutes.
function Get-LimitReset($text, $now = (Get-Date)) {
    if ("$text" -match 'resets\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*([ap]m)') {
        $h = [int]$matches[1] % 12; if ($matches[3] -eq 'pm') { $h += 12 }
        $m = if ($matches[2]) { [int]$matches[2] } else { 0 }
        $t = $now.Date.AddHours($h).AddMinutes($m + 2)
        if ($t -le $now) { $t = $t.AddDays(1) }
        return $t
    }
    $now.AddMinutes(60)
}
# How many times this task already stopped unfinished (used by the loop guard).
function Get-PriorStops($n) {
    $c = Invoke-Gh api "repos/$Repo/issues/$n/comments" --paginate | ConvertFrom-Json
    @($c | Where-Object { $_.body -match 'stopped before finishing' }).Count
}

# Auto-merge (no AI): for each open PR from a task/* branch, merge it into a scratch copy of main, keep each task's
# HANDOFF.md under docs/handoffs/, run `node --test`; push to main only if every test passes. Anything else is left for a human.
function Get-MergeDecision($mergeOk, $testsOk) {
    if (-not $mergeOk) { return "conflict" }
    if (-not $testsOk) { return "tests-failed" }
    return "merge"
}
function Merge-ReadyPRs {
    $prs = Invoke-Gh pr list -R $Repo --state open --json "number,headRefName,title,comments" --limit 30 | ConvertFrom-Json
    foreach ($pr in ($prs | Where-Object { $_.headRefName -like "task/*" } | Sort-Object number)) {
        if ($pr.comments | Where-Object { $_.body -match '^auto-merge: skipped' }) { continue }   # already reported; a human decides
        $m = Join-Path $root "merge"
        if (-not (Test-Path (Join-Path $m ".git"))) { if (Test-Path $m) { Remove-Item $m -Recurse -Force }; git clone -q "https://github.com/$Repo.git" $m }
        git -C $m fetch -q --prune origin
        git -C $m checkout -q -B main origin/main
        git -C $m reset -q --hard origin/main
        git -C $m clean -qfd
        $n = if ($pr.headRefName -match '^task/(\d+)') { $matches[1] } else { $pr.number }
        $mergeOk = $true
        try { git -C $m -c user.name="REDLINE conductor" -c user.email="redline-conductor@users.noreply.github.com" merge -q --no-ff --no-edit -m "Merge PR #$($pr.number): $($pr.title)" "origin/$($pr.headRefName)" }
        catch { $mergeOk = $false; try { git -C $m merge --abort } catch { } }
        $testsOk = $false
        if ($mergeOk) {
            if (Test-Path (Join-Path $m "HANDOFF.md")) {
                New-Item -ItemType Directory (Join-Path $m "docs\handoffs") -Force | Out-Null
                git -C $m mv -f HANDOFF.md "docs/handoffs/issue-$n.md"
                git -C $m -c user.name="REDLINE conductor" -c user.email="redline-conductor@users.noreply.github.com" commit -q -m "Keep #$n handoff notes under docs/handoffs"
            }
            Push-Location $m; try { $t = Invoke-Native "node" @("--test"); $testsOk = ($t.Code -eq 0) } finally { Pop-Location }
        }
        switch (Get-MergeDecision $mergeOk $testsOk) {
            "merge" {
                git -C $m push -q origin HEAD:main
                if ($pr.headRefName -match '^task/(\d+)') { try { Invoke-Gh issue close $matches[1] -R $Repo --reason completed | Out-Null } catch { } }
                Log "auto-merged PR #$($pr.number) ($($pr.title)); tests pass; site redeploys"
            }
            "conflict" {
                Invoke-Gh pr comment $pr.number -R $Repo --body "auto-merge: skipped. Merge conflict with main; needs a human." | Out-Null
                Log "auto-merge skipped PR #$($pr.number): merge conflict"
            }
            "tests-failed" {
                Invoke-Gh pr comment $pr.number -R $Repo --body "auto-merge: skipped. ``node --test`` fails after merging into main; needs a human." | Out-Null
                Log "auto-merge skipped PR #$($pr.number): tests fail after merge"
            }
        }
    }
}

function Merge-ReadyPRsBatch {
    # Fast path: ONE fetch, merge every finished task PR locally, run the tests ONCE, push ONCE. If the combined result fails the tests, fall back to the slow one-by-one path so the bad PR is found and skipped.
    $prList = Invoke-Gh pr list -R $Repo --state open --json "number,headRefName,title,comments" --limit 50 | ConvertFrom-Json   # store first: PowerShell 5.1 passes a JSON array as ONE object until it is piped
    $prs = @($prList | ForEach-Object { $_ })
    $prs = @($prs | Where-Object { $_.headRefName -like "task/*" -and -not ($_.comments | Where-Object { $_.body -match '^auto-merge: skipped' }) } | Sort-Object number)
    if ($prs.Count -eq 0) { return }
    $m = Join-Path $root "merge"
    if (-not (Test-Path (Join-Path $m ".git"))) { if (Test-Path $m) { Remove-Item $m -Recurse -Force }; git clone -q "https://github.com/$Repo.git" $m }
    git -C $m fetch -q --prune origin
    git -C $m checkout -q -B main origin/main
    git -C $m reset -q --hard origin/main
    git -C $m clean -qfd
    $taken = @()
    foreach ($pr in $prs) {
        $n = if ($pr.headRefName -match '^task/(\d+)') { $matches[1] } else { $pr.number }
        $mergeOk = $true
        try { git -C $m -c gc.auto=0 -c user.name="REDLINE conductor" -c user.email="redline-conductor@users.noreply.github.com" merge -q --no-ff --no-edit -m "Merge PR #$($pr.number): $($pr.title)" "origin/$($pr.headRefName)" }
        catch { $mergeOk = $false; try { git -C $m merge --abort } catch { } }
        if (-not $mergeOk) {
            Invoke-Gh pr comment $pr.number -R $Repo --body "auto-merge: skipped. Merge conflict with main; needs a human." | Out-Null
            Log "auto-merge skipped PR #$($pr.number): merge conflict"
            continue
        }
        if (Test-Path (Join-Path $m "HANDOFF.md")) {
            New-Item -ItemType Directory (Join-Path $m "docs\handoffs") -Force | Out-Null
            git -C $m mv -f HANDOFF.md "docs/handoffs/issue-$n.md"
            git -C $m -c gc.auto=0 -c user.name="REDLINE conductor" -c user.email="redline-conductor@users.noreply.github.com" commit -q -m "Keep #$n handoff notes under docs/handoffs"
        }
        $taken += [pscustomobject]@{ pr = $pr.number; issue = $n; title = $pr.title }
    }
    if ($taken.Count -eq 0) { return }
    $testsOk = $false
    Push-Location $m; try { $t = Invoke-Native "node" @("--test"); $testsOk = ($t.Code -eq 0) } finally { Pop-Location }
    if ($testsOk) {
        git -C $m push -q origin HEAD:main
        foreach ($x in $taken) { try { Invoke-Gh issue close $x.issue -R $Repo --reason completed | Out-Null } catch { } }
        Log "auto-merged $($taken.Count) PRs in one batch ($(($taken | ForEach-Object { '#' + $_.pr }) -join ', ')); tests pass; site redeploys"
    } else {
        Log "batch failed the tests; falling back to one-by-one merging to find the bad PR"
        Merge-ReadyPRs
    }
}
function Save-Progress($wt, $i) {
    if (git -C $wt.Path status --porcelain) { git -C $wt.Path add -A; git -C $wt.Path commit -q -m "wip: checkpoint for #$($i.number) ($who)" }
    git -C $wt.Path push -q origin $wt.Branch
}

if ($MergeOnly) {
    $who = "$env:COMPUTERNAME/merger"; Log "auto-merge loop started (repo $Repo): merges finished task PRs that pass node --test"
    while ($true) { try { Merge-ReadyPRsBatch } catch { Log "auto-merge error: $_ | $(($_.ScriptStackTrace -split "[\r\n]+")[0..2] -join ' / ')" }; if ($Once) { break }; Start-Sleep 15 }
    return
}
Log "started (repo $Repo, reserve $Reserve%)"
while ($true) {
    $i = $null; $claim = $null
    if ($StopAt -and (Get-Date) -ge [datetime]$StopAt) { Log "reached -StopAt $StopAt; stopping"; break }
    try {
        if (-not $DryRun -and -not (git ls-remote --heads "https://github.com/$Repo.git" main)) { Log "repo has no main branch yet; waiting"; if ($Once) { break }; Start-Sleep 300; continue }
        if (-not (Test-Available)) { if ($Once) { break }; Start-Sleep 300; continue }
        if ($AutoMerge -and -not $DryRun) { try { Merge-ReadyPRsBatch } catch { Log "auto-merge error: $_" } }
        if ($StandbyFor -and -not $DryRun) { $pc = Get-RecentComments; if ($null -eq $pc -or -not (Test-PeerDown $StandbyFor $pc)) { if (-not $script:standbyLogged) { Log "standby: $StandbyFor is working; waiting"; $script:standbyLogged = $true }; if ($Once) { break }; Start-Sleep 60; continue }; if ($script:standbyLogged) { Log "standby: $StandbyFor is down or out of usage; taking over"; $script:standbyLogged = $false } }
        $i = Find-Task
        if (-not $i) { if ($Once) { break }; Start-Sleep 60; continue }
        $claim = Claim $i; if (-not $claim) { continue }
        Log "working on #$($i.number): $($i.title)"
        if ($DryRun) { Release $i $claim "dry run: claimed and released without running the agent"; break }
        $wt = Prepare-Worktree $i
        $hb = Start-Job -ArgumentList $Repo, $claim.id, $who -ScriptBlock { param($r, $id, $w) while ($true) { Start-Sleep 300; gh api -X PATCH "repos/$r/issues/comments/$id" -f body="conductor-claim: $w heartbeat $(Get-Date -Format o)" | Out-Null } }
        try { $out = Run-Agent $i $wt } finally { Stop-Job $hb; Remove-Job $hb -Force }
        Add-Content (Join-Path $state "$Agent.log") $out
        Save-Progress $wt $i
        $status = Get-HandoffStatus $wt.Path
        if ($status -and $status.Matches[0].Groups[1].Value -eq "DONE") {
            $pr = New-PullRequest $i $wt.Branch
            Release $i $claim "done, PR: $pr" -Done
        } elseif ($status) {
            Release $i $claim "blocked: $($status.Matches[0].Groups[1].Value). Progress saved on branch $($wt.Branch)." -Blocked
        } elseif ($out -match $limitPattern) {
            $until = Get-LimitReset $out
            if ($Agent -eq "codex") { $rl = Get-CodexLimits; if ($rl.primary.resets_at) { $r2 = [DateTimeOffset]::FromUnixTimeSeconds([long]$rl.primary.resets_at).LocalDateTime.AddMinutes(2); if ($r2 -gt (Get-Date)) { $until = $r2 } } }   # never a cooldown that already ended
            Set-Cooldown $until
            Release $i $claim "out of usage; progress saved on branch $($wt.Branch), back in the queue"
        } else {
            # Loop guard: if this task already stopped unfinished twice, stop retrying and ask a human instead of burning usage.
            # A crash within 2 minutes is an environment problem (login expired, usage message not recognised, network), not the task's fault: no strike, no blocking, show the reason and pause 10 minutes.
            $fastFail = ($script:lastExit -ne 0 -and $script:lastSeconds -lt 120)
            if ($fastFail) { $why = (($out -replace '\s+', ' ').Trim()); if ($why.Length -gt 300) { $why = $why.Substring(0, 300) }; Log "agent failed fast (exit $($script:lastExit), $($script:lastSeconds)s): $why"; Set-Cooldown (Get-Date).AddMinutes(10); Release $i $claim "agent failed right away (not the task's fault); back in the queue. Reason: $why" }
            $prior = if ($fastFail) { -1 } else { Get-PriorStops $i.number }
            if ($prior -ge 2) { Release $i $claim "stopped unfinished $($prior + 1) times; needs a human look (loop guard). Progress saved on branch $($wt.Branch)." -Blocked }
            elseif (-not $fastFail) { Release $i $claim "stopped before finishing; progress saved on branch $($wt.Branch), back in the queue" }
        }
        $script:ranTasks++; if ($MaxTasks -gt 0 -and $script:ranTasks -ge $MaxTasks) { Log "reached -MaxTasks $MaxTasks; stopping"; break }
        if ($PaceMinutes -gt 0 -and -not $Once) { $nap = $PaceMinutes * 60; if ($StopAt) { $left = [int](([datetime]$StopAt) - (Get-Date)).TotalSeconds; if ($left -lt $nap) { $nap = [Math]::Max($left, 0) } }; Log "pacing: resting $([Math]::Round($nap / 60, 1)) min to spread usage"; Start-Sleep $nap }
        if ($Once) { break }
    } catch {
        Log "error: $_ (line $($_.InvocationInfo.ScriptLineNumber))"
        if ($i -and $claim) { try { Release $i $claim "hit an error ($_); back in the queue" } catch { } }   # never leave a dead claim behind
        if ($Once) { break }; Start-Sleep 120
    }
}
