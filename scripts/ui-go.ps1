# ui-go.ps1 - Fable designs a polished REDLINE UI in a THROWAWAY copy of the repo and exports a preview to Downloads.
# Nothing touches the real repo or main. You give feedback, then run again with -Feedback to revise. Shipping (push + PR) is a separate manual step.
#   .\ui-go.ps1                              round 1 (fresh clone, design, export preview)
#   .\ui-go.ps1 -Feedback "text or file"     next round (keeps the same work copy, applies your feedback, re-exports)
param([string]$Feedback = "", [string]$FableModel = "claude-fable-5-2", [string]$FableEffort = "high", [int]$MaxMinutes = 80, [switch]$DryRun, [switch]$WaitForReset)
$ErrorActionPreference = "Continue"
$Repo = "AkarshSharma2012/REDLINE"
$Base = "C:\Users\Neeraj Sharma\redline-conductor"
$W = "$Base\ui-work"
$State = "$Base\state"
$Log = "$State\ui.log"
$Status = "$State\ui-status.txt"
$Preview = Join-Path $env:USERPROFILE "Downloads\REDLINE-UI-preview"
$Branch = "task/ui-polish"
New-Item -ItemType Directory -Force -Path $State | Out-Null
$Host.UI.RawUI.WindowTitle = "UI GO - polished UI preview (Fable)"
function Log($m) { $l = "{0} {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $m; Write-Host $l; Add-Content -Path $Log -Value $l }
function SetStatus($m) { Set-Content -Path $Status -Value ("{0} {1}" -f (Get-Date -Format "HH:mm:ss"), $m); Log "STATUS: $m" }
function G { $o = & git.exe -C $W @args 2>&1 | Out-String; $script:gcode = $LASTEXITCODE; $o.Trim() }
function Fail($why) { SetStatus "FAILED: $why"; Log "UI run stopped: $why. The real repo was not touched."; exit 1 }

function Set-UiIdentity {
    # Existing contributor email verified in ui-work history and this agent's git config.
    $env:GIT_AUTHOR_NAME = $env:GIT_COMMITTER_NAME = "akarshsharma2012"
    $env:GIT_AUTHOR_EMAIL = $env:GIT_COMMITTER_EMAIL = "219518258+AkarshSharma2012@users.noreply.github.com"
    G config user.name $env:GIT_AUTHOR_NAME | Out-Null
    if ($script:gcode -ne 0) { Fail "cannot configure contributor name" }
    G config user.email $env:GIT_AUTHOR_EMAIL | Out-Null
    if ($script:gcode -ne 0) { Fail "cannot configure contributor email" }
}
function Preserve-UiDirectory([string]$Path, [switch]$Move) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    $full = [IO.Path]::GetFullPath($Path)
    if ($full -notin @([IO.Path]::GetFullPath($W), [IO.Path]::GetFullPath($Preview))) {
        throw "Refusing to preserve unexpected directory: $full"
    }
    $backup = "$full.preserved-$([Guid]::NewGuid().ToString('N'))"
    if ($Move) { Move-Item -LiteralPath $full -Destination $backup -ErrorAction Stop }
    else { Copy-Item -LiteralPath $full -Destination $backup -Recurse -ErrorAction Stop }
    Log "Preserved $full at $backup"
}

# A second invocation must exit before waiting, cloning or changing status/logs.
$uiMutex = New-Object System.Threading.Mutex($false, 'Local\REDLINE-UI-GO')
$ownsUiMutex = $false
try { $ownsUiMutex = $uiMutex.WaitOne(0) }
catch [System.Threading.AbandonedMutexException] { $ownsUiMutex = $true }
if (-not $ownsUiMutex) { $uiMutex.Dispose(); throw "Another UI run already owns the launch lock" }
try {

if ($WaitForReset) {
    # keep the PC awake while this window is open (per-process, no system setting is changed)
    try { Add-Type -Namespace W -Name P -MemberDefinition '[System.Runtime.InteropServices.DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f);' ; [void][W.P]::SetThreadExecutionState(2147483649) } catch {}
    $reset = 0
    foreach ($ln in (Get-Content "$State\ui-fable.log" -ErrorAction SilentlyContinue)) { if ($ln -match '"status":"rejected","resetsAt":(\d+)') { $reset = [long]$Matches[1] } }
    if ($reset -gt 0) {
        $at = [DateTimeOffset]::FromUnixTimeSeconds($reset + 120).LocalDateTime
        Log "usage window resets; waiting until $($at.ToString('HH:mm')) before starting"
        while ((Get-Date) -lt $at) { Set-Content -Path $Status -Value ("{0} WAITING for the Claude usage window to reset at {1}" -f (Get-Date -Format "HH:mm:ss"), $at.ToString("HH:mm")); Start-Sleep -Seconds 30 }
    } else { Fail "no verified reset timestamp; refusing to launch" }
}$revise = [bool]$Feedback
if ($revise -and (Test-Path $Feedback)) { $Feedback = Get-Content -Raw $Feedback }

if (-not $revise) {
    SetStatus "A: fresh clone of main (+ the F1 engine branch if not merged yet)"
    Preserve-UiDirectory $W -Move
    & git.exe clone --quiet "https://github.com/$Repo.git" $W 2>&1 | Out-Null
    if (-not (Test-Path "$W\package.json")) { Fail "clone failed" }
    Set-UiIdentity
    G checkout -b $Branch | Out-Null
    G fetch origin task/55-f1-evidence-engine 2>&1 | Out-Null
    $anc = G merge-base --is-ancestor origin/task/55-f1-evidence-engine HEAD;
    if ($script:gcode -ne 0) { Log "F1 engine not on main yet; merging its branch into the throwaway copy so the UI shows real labels"; G merge --no-edit origin/task/55-f1-evidence-engine | Out-Null }
    Push-Location $W; $t = & node.exe --test 2>&1 | Out-String; $tc = $LASTEXITCODE; Pop-Location
    if ($tc -ne 0) { Fail "baseline tests are not green before the UI run" }
    Set-Content -Path "$State\ui-base.txt" -Value (G rev-parse HEAD)
    Log "baseline tests green"
} else {
    if (-not (Test-Path "$W\package.json")) { Fail "no work copy found; run round 1 first" }
    SetStatus "A: revise round (your feedback is applied to the existing work copy)"
    Set-UiIdentity
}
if ($DryRun) { SetStatus "DRY RUN OK: work copy ready, nothing else was run"; exit 0 }
Preserve-UiDirectory $Preview

SetStatus "B: Fable ($FableModel, effort $FableEffort) designing the UI"
$prompt = @'
You are the lead product designer AND front-end engineer for REDLINE: a static, no-build GitHub Pages web app (plain ES modules, index.html, src/main.js, src/styles.css, src/ui/*.js) that helps NASA materials scientists judge fire-risk evidence for materials in lunar/partial gravity. Work ONLY in this folder (a throwaway copy of the repo). Never push. Any dev server or browser you start for screenshots MUST be stopped before you finish. Preserve the configured author and committer identity; never add attribution trailers to commits.

GOAL: make the interface look and feel like the best polished desktop-grade AI/dev tools (Claude, Codex, Linear, Raycast): calm, crisp, confident, dense but breathable, built for a materials scientist who reads numbers, units, uncertainty and citations all day. Not a poster, not a marketing page. The evidence is the interface.

SKILLS: load and use these with the Skill tool, in this order of relevance: autopilot (route the work), uncodixfy, interface-design, ui-craft, ui-craft-dense-dashboard, desktop-utility-design, frontend-design, impeccable (critique and polish passes), web-design-guidelines (audit), webapp-testing (screenshots). The project's DESIGN.md OVERRIDES every skill default. Read DESIGN.md, AGENTS.md and docs/specs (screen-by-screen specs) first. If you believe a DESIGN.md rule should change, do NOT change the rule: list it as a proposal in the questions for the user.

WHAT TO IMPROVE (all of it, all six tabs: Cabin Check first, Investigations, Gravity, Oxygen, Accuracy, Ask): typographic system (system font stack only, tabular numerals for data, a real type scale), spacing scale and rhythm, a coherent token set, refined surfaces and hairline borders, table design (sticky header, row hover/selected, aligned numerics, units muted, uncertainty visible), label chips that follow the 'never colour alone' rule, evidence panel and citation presentation, form controls and the O2 slider, empty/loading/error states, focus rings and full keyboard navigation (add small tasteful keyboard shortcuts if cheap), responsive layout from 390px phone to 1920px desktop, reduced-motion, print-friendly basics. Keep motion minimal and purposeful.

HARD CONSTRAINTS (tests enforce them): do not touch src/rules/, src/schema/, data files or any science wording; every label text stays exactly what label.js produces; `node --test` must stay fully green with the existing tests unchanged (if a test pins DOM structure, keep that structure and add classes/wrappers around it instead); no new dependencies, no build step, no CDN, no web fonts, no external requests, keep the page-size budget; no gradients, glass/blur, glow, decorative shadows, emoji, illustrations, green 'check' styling for evidence, or rocket/flame art (DESIGN.md banned list). Only edit index.html, src/styles.css, src/main.js (presentation only) and src/ui/*.js (presentation only), plus new files under src/ui/ if needed.

PROCESS: (1) capture 'before' screenshots of every tab at 1440x900 and 390x844 using headless Chrome or Edge (C:\Program Files\Google\Chrome\Application\chrome.exe) or Playwright, from a short-lived local static server (ES modules do not load from file://). (2) Write a short design plan (principles, tokens, what changes per tab). (3) Implement. (4) Take 'after' screenshots, LOOK at them (Read the PNGs), critique them hard with the impeccable and web-design-guidelines skills, and iterate at least twice; check contrast numbers, tap targets, focus order, long-label wrapping, 0-row and 45-row tables, and the narrowest phone width. (5) Commit on this branch after each step. (6) Export the preview (below).

EXPORT, the deliverable: create folder {{PREVIEW}} (delete and recreate it if it exists) containing: app\ (a complete copy of everything the app needs to run: index.html, src/, data/ or whatever it fetches), OPEN-PREVIEW.cmd (double-click: starts a tiny Node static server for app\ on port 5199 with `node -e`, opens http://localhost:5199 in the default browser, and prints how to stop it), screenshots\ (before-*.png and after-*.png for every tab at desktop and phone), and README-PREVIEW.md (max 40 lines: what changed per tab in plain language, the design principles, which DESIGN.md rules you propose changing and why, and 5 to 8 specific questions for the user to react to). Write UI-HANDOFF.md at the repo root of the work copy ending with the line STATUS: DONE (or STATUS: BLOCKED: <reason>), a note of how you verified it, and that `node --test` is green.

{{FEEDBACK}}
'@
$fb = if ($revise) { "THIS IS A REVISION ROUND. The user reviewed the previous preview. Their feedback, verbatim, is the top priority; apply every point, push back in README-PREVIEW.md only where a hard constraint forbids it. Keep what they did not criticise. Redo the screenshots and re-export the preview folder the same way.`n`nUSER FEEDBACK:`n$Feedback" } else { "" }
$mockDir = Join-Path $env:USERPROFILE "Downloads\REDLINE-UI-mockups"
$mock = if (Test-Path $mockDir) { "AVAILABLE MOCKUPS (approval unverified): picture mockups exist in $mockDir (PNGs, MOCKUP-NOTES.md, HTML in source\). Folder existence does not establish user review or approval. Inspect them as references; only explicit user feedback establishes an approved visual target. Follow DESIGN.md and the user's actual instructions." } else { "" }
$fb = $mock + "`n`n" + $fb
$prompt = $prompt.Replace("{{PREVIEW}}", $Preview).Replace("{{FEEDBACK}}", $fb)
$promptFile = "$State\ui-prompt-fable.txt"
[System.IO.File]::WriteAllText($promptFile, $prompt)
if (-not (Test-Path $promptFile) -or (Get-Item $promptFile).Length -lt 500) { Fail "prompt file was not written" }

$claude = (Get-Command claude -ErrorAction Stop).Source
$out = "$State\ui-fable.log"; $err = "$State\ui-fable.err"
Set-Content -Path $out -Value ""; Set-Content -Path $err -Value ""
$started = Get-Date
$fp = Start-Process -FilePath $claude -ArgumentList @("-p", "--model", $FableModel, "--dangerously-skip-permissions", "--effort", $FableEffort, "--output-format", "stream-json", "--verbose") `
      -WorkingDirectory $W -RedirectStandardInput $promptFile -RedirectStandardOutput $out -RedirectStandardError $err -WindowStyle Hidden -PassThru
Log "Fable started (pid $($fp.Id))"
while (-not $fp.HasExited) {
    Start-Sleep -Seconds 20
    $min = [int]((Get-Date) - $started).TotalMinutes
    Set-Content -Path $Status -Value ("{0} B: Fable designing, {1} min elapsed" -f (Get-Date -Format "HH:mm:ss"), $min)
    if (((Get-Date) - $started).TotalMinutes -ge $MaxMinutes) { Log "time limit reached; stopping Fable"; Stop-Process -Id $fp.Id -Force; break }
    if (Select-String -Path $out -Pattern '"status":"rejected"' -Quiet) { Log "usage limit hit; stopping Fable"; Stop-Process -Id $fp.Id -Force; Fail "Claude usage limit reached; work so far is kept in $W (commits on $Branch)" }
}
Log "Fable exited after $([int]((Get-Date) - $started).TotalMinutes) min"

SetStatus "C: verifying"
Push-Location $W; $t = & node.exe --test 2>&1 | Out-String; $tc = $LASTEXITCODE; Pop-Location
$dirty = G status --porcelain
if ($dirty) { G add -A | Out-Null; G commit -q -m "ui: polish (uncommitted leftovers)" | Out-Null }
$baseSha = (Get-Content "$State\ui-base.txt" -ErrorAction SilentlyContinue | Select -First 1)
$bad = (G diff --name-only $baseSha HEAD) -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^(src/rules/|src/schema/|data/|tests/)' }
$hand = if (Test-Path "$W\UI-HANDOFF.md") { Get-Content -Raw "$W\UI-HANDOFF.md" } else { "" }
$prevOk = (Test-Path "$Preview\OPEN-PREVIEW.cmd") -and (Test-Path "$Preview\README-PREVIEW.md") -and (Test-Path "$Preview\app\index.html") -and ((Get-ChildItem "$Preview\screenshots" -Filter *.png -ErrorAction SilentlyContinue).Count -ge 6)
if ($tc -ne 0) { Fail "node --test is RED in the work copy (preview may still be in $Preview); say 'fix the ui tests' and I will have it repaired" }
if ($bad) { Fail "Fable edited protected paths: $($bad -join ', ')" }
if (-not $prevOk) { Fail "preview folder is incomplete: $Preview" }
if ($hand -notmatch 'STATUS: DONE') { Fail "UI-HANDOFF.md does not say STATUS: DONE" }
SetStatus "DONE: preview ready in $Preview (tests green). Open OPEN-PREVIEW.cmd, then give feedback."
Log "UI preview ready: $Preview"
} finally {
    if ($ownsUiMutex) { $uiMutex.ReleaseMutex() }
    $uiMutex.Dispose()
}
