$ErrorActionPreference = 'Stop'
$ast = [System.Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'conductor.ps1'), [ref]$null, [ref]$null)
foreach ($f in $ast.FindAll({ $args[0] -is [System.Management.Automation.Language.FunctionDefinitionAst] }, $false)) { . ([scriptblock]::Create($f.Extent.Text)) }
$tmp = Join-Path $env:TEMP "merger-245-$([guid]::NewGuid().ToString('N'))"
New-Item -ItemType Directory $tmp | Out-Null
$state = $tmp; $root = $tmp; $Repo = 'test/repo'; $who = 'test'; $Agent = 'codex'
$pass = 0; $fail = 0
function Check($name, [scriptblock]$test) { try { if (-not (& $test)) { throw 'assertion failed' }; $script:pass++; Write-Host "PASS $name" } catch { $script:fail++; Write-Host "FAIL $name : $_" } }
Check 'changed head retries immediately despite historical skip' {
    $old = @{ head = 'old'; base = 'base'; next = [datetime]::UtcNow.AddHours(1).ToString('o'); attempts = 1; reason = 'tests-failed' }
    (Test-MergeRetry $old 'new' 'base') -and -not (Test-MergeRetry $old 'old' 'base')
}
Check 'changed base retries immediately' { Test-MergeRetry @{ head='h'; base='old'; next=[datetime]::UtcNow.AddHours(1).ToString('o') } 'h' 'new' }
Check 'unchanged failure deduplicates comments and caps backoff' {
    $x = New-MergeFailure $null 'h' 'b' 'conflict'
    $y = New-MergeFailure $x 'h' 'b' 'conflict'
    $z = $y; 1..20 | ForEach-Object { $z = New-MergeFailure $z 'h' 'b' 'conflict' }
    $x.notify -and -not $y.notify -and $z.delay -eq 900
}
Check 'single merger lock excludes second owner' {
    $a = Open-MergerLock
    try { $b = Open-MergerLock; if ($b) { $b.Dispose(); return $false }; return $true } finally { if ($a) { $a.Dispose() } }
}
$repoDir = Join-Path $tmp 'repo'
git init -q $repoDir
git -C $repoDir config user.name akarshsharma2012
git -C $repoDir config user.email 219518258+AkarshSharma2012@users.noreply.github.com
Set-Content (Join-Path $repoDir 'file.txt') 'base'
git -C $repoDir add .; git -C $repoDir commit -qm base
$baseSha = git -C $repoDir rev-parse HEAD
git -C $repoDir checkout -qb left
[IO.File]::WriteAllBytes((Join-Path $repoDir 'HANDOFF.md'), [byte[]](65,13,10,255))
git -C $repoDir add .; git -C $repoDir commit -qm left
$left = git -C $repoDir rev-parse HEAD
git -C $repoDir checkout -qb right $baseSha
Set-Content (Join-Path $repoDir 'HANDOFF.md') 'right notes'
git -C $repoDir add .; git -C $repoDir commit -qm right
$right = git -C $repoDir rev-parse HEAD
git -C $repoDir checkout -q --detach $left
Check 'HANDOFF add/add preserves both blobs byte for byte' {
    $ok = Merge-Candidate $repoDir ([pscustomobject]@{ number=1; title='collision'; headRefOid=$right })
    $blobs = @(git -C $repoDir ls-tree -r --name-only HEAD docs/handoffs)
    $ids = @($blobs | ForEach-Object { git -C $repoDir rev-parse "HEAD:$_" })
    $ok -and $ids -contains (git -C $repoDir rev-parse "${left}:HANDOFF.md") -and $ids -contains (git -C $repoDir rev-parse "${right}:HANDOFF.md") -and -not (Test-Path (Join-Path $repoDir 'HANDOFF.md'))
}
git -C $repoDir checkout -qb bad $baseSha
Set-Content (Join-Path $repoDir 'file.txt') 'bad'
git -C $repoDir add .; git -C $repoDir commit -qm bad
$bad = git -C $repoDir rev-parse HEAD
git -C $repoDir checkout -qb other $baseSha
Set-Content (Join-Path $repoDir 'file.txt') 'other'
git -C $repoDir add .; git -C $repoDir commit -qm other
Check 'source conflicts are never resolved automatically' { -not (Merge-Candidate $repoDir ([pscustomobject]@{number=2;title='bad';headRefOid=$bad})) }
Check 'bad PR isolation keeps subsequent clean PR testable' {
    $script:calls = @(); $script:attempts = 0
    function New-MergeTrial($source, $sha) { $sha }
    function Merge-Candidate($m, $pr) { $script:calls += $pr.number; $true }
    function Test-MergedTree($m) { $m -ne 'bad' }
    function Get-MergeSha($m) { if ($script:calls[-1] -eq 1) { 'bad' } else { 'good' } }
    function Register-MergeFailure($pr, $base, $reason) { }
    # The isolation routine must retain the last accepted tree when a candidate fails.
    function Test-MergedTree($m) { $script:attempts++; $script:attempts -gt 1 }
    $r = Invoke-IsolatedMerges 'source' 'base' @([pscustomobject]@{number=1}, [pscustomobject]@{number=2})
    $r.taken.Count -eq 1 -and $r.taken[0].number -eq 2 -and $r.sha -eq 'good' -and ($script:calls -join ',') -eq '1,2'
}
Check 'real node --test rejects bad PR and accepts independent clean PR' {
    $fixture = Join-Path $tmp 'node-fixture'
    git init -q $fixture
    git -C $fixture config user.name akarshsharma2012
    git -C $fixture config user.email 219518258+AkarshSharma2012@users.noreply.github.com
    Set-Content (Join-Path $fixture 'value.cjs') 'module.exports = 1;'
    Set-Content (Join-Path $fixture 'value.test.cjs') "require('node:test')('value', () => require('node:assert/strict').equal(require('./value.cjs'), 1));"
    git -C $fixture add .; git -C $fixture commit -qm baseline
    $start = Get-MergeSha $fixture
    git -C $fixture checkout -qb broken
    Set-Content (Join-Path $fixture 'value.cjs') 'module.exports = 2;'
    git -C $fixture add .; git -C $fixture commit -qm broken
    $broken = Get-MergeSha $fixture
    git -C $fixture checkout -qb clean $start
    Set-Content (Join-Path $fixture 'clean.txt') 'independent'
    git -C $fixture add .; git -C $fixture commit -qm clean
    $clean = Get-MergeSha $fixture
    $script:mergeRun = $tmp; $script:mergeFailures = @{}; $script:mergeFailureFile = Join-Path $tmp 'failures.json'; $MergeVerifyOnly = $true
    $candidates = @([pscustomobject]@{ number=10;title='broken';headRefOid=$broken }, [pscustomobject]@{ number=11;title='clean';headRefOid=$clean })
    $result = Invoke-IsolatedMerges $fixture $start $candidates
    $result.taken.Count -eq 1 -and $result.taken[0].number -eq 11 -and (Test-MergedTree $result.tree) -and $script:mergeFailures['10'].base -eq $start
}
Write-Host "$pass passed, $fail failed; retained fixtures: $tmp"
exit $fail
