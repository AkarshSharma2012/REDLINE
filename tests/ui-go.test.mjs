import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const source = new URL('../scripts/ui-go.ps1', import.meta.url);

test('scheduled UI source preserves attribution, work and reset boundary without launching Claude', {
  skip: process.platform !== 'win32' ? 'PowerShell orchestration requires Windows' : false,
}, () => {
  const script = String.raw`
$ErrorActionPreference = 'Stop'
$tokens = $null; $errors = $null
$ast = [Management.Automation.Language.Parser]::ParseFile($env:UI_SOURCE, [ref]$tokens, [ref]$errors)
if ($errors.Count) { throw ($errors | Out-String) }
# Only load the named pure setup functions, never the orchestration body.
$functions = $ast.FindAll({ param($a) $a -is [Management.Automation.Language.FunctionDefinitionAst] }, $true)
foreach ($name in @('Set-UiIdentity', 'Preserve-UiDirectory')) {
    $fn = $functions | Where-Object Name -eq $name
    . ([scriptblock]::Create($fn.Extent.Text))
}
function Log($message) {}
function Fail($message) { throw $message }
function G { & git.exe -C $W @args; $script:gcode = $LASTEXITCODE }
function Assert($condition, $message) { if (-not $condition) { throw $message } }
$root = Join-Path ([IO.Path]::GetTempPath()) ('redline-ui-test-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $root | Out-Null
try {
    $W = Join-Path $root 'ui-work'; $Preview = Join-Path $root 'preview'
    & git.exe init --quiet $W
    Assert ($LASTEXITCODE -eq 0) 'temporary git init failed'
    $env:GIT_AUTHOR_NAME = $env:GIT_COMMITTER_NAME = 'wrong'
    $env:GIT_AUTHOR_EMAIL = $env:GIT_COMMITTER_EMAIL = 'wrong@example.invalid'
    Set-UiIdentity
    Assert ((G var GIT_AUTHOR_IDENT) -match '^akarshsharma2012 <219518258\+AkarshSharma2012@users.noreply.github.com>') 'author not corrected'
    Assert ((G var GIT_COMMITTER_IDENT) -match '^akarshsharma2012 <219518258\+AkarshSharma2012@users.noreply.github.com>') 'committer not corrected'
    Set-Content (Join-Path $W 'uncommitted.txt') 'keep work'
    Preserve-UiDirectory $W -Move
    Assert (-not (Test-Path $W)) 'old work path still occupied'
    $saved = @(Get-ChildItem $root -Directory -Filter 'ui-work.preserved-*')
    Assert ($saved.Count -eq 1) 'work backup missing'
    Assert ((Get-Content (Join-Path $saved[0].FullName 'uncommitted.txt')) -eq 'keep work') 'dirty work lost'
    Assert (Test-Path (Join-Path $saved[0].FullName '.git')) 'git history lost'
    New-Item -ItemType Directory $Preview | Out-Null
    Set-Content (Join-Path $Preview 'reviewed.txt') 'keep preview'
    Preserve-UiDirectory $Preview
    Assert (Test-Path (Join-Path $Preview 'reviewed.txt')) 'current preview removed'
    $savedPreview = @(Get-ChildItem $root -Directory -Filter 'preview.preserved-*')
    Assert ($savedPreview.Count -eq 1) 'preview backup missing'
    Assert ((Get-Content (Join-Path $savedPreview[0].FullName 'reviewed.txt')) -eq 'keep preview') 'preview content lost'
    $unexpected = Join-Path $root 'unexpected'; New-Item -ItemType Directory $unexpected | Out-Null
    $rejected = $false
    try { Preserve-UiDirectory $unexpected -Move } catch { $rejected = $true }
    Assert $rejected 'unexpected path accepted'
    # Execute just the reset guard with a fixed pre-reset clock and a sleep sentinel.
    $wait = $ast.Find({ param($a) $a -is [Management.Automation.Language.IfStatementAst] -and $a.Clauses[0].Item1.Extent.Text -eq '$WaitForReset' }, $true)
    Assert ($null -ne $wait) 'reset guard missing'
    $State = $root; $Status = Join-Path $root 'status.txt'; $WaitForReset = $true
    Set-Content (Join-Path $root 'ui-fable.log') '{"status":"rejected","resetsAt":1794747600}'
    function Add-Type {}
    function Get-Date { [datetime]'2026-11-15T03:40:00' }
    function Start-Sleep { throw 'TEST_WAIT' }
    try { & ([scriptblock]::Create($wait.Extent.Text)) } catch { Assert ($_.Exception.Message -eq 'TEST_WAIT') 'unexpected wait failure' }
    Assert ($at -eq $null) 'wait leaked scope'
    # Capture the computed instant within the evaluated block independently of host timezone.
    $atCapture = $wait.Extent.Text.Replace('Start-Sleep -Seconds 30', 'throw ("TEST_WAIT_AT:" + $at.ToUniversalTime().ToString("s"))')
    try { & ([scriptblock]::Create($atCapture)) } catch { Assert ($_.Exception.Message -eq 'TEST_WAIT_AT:2026-11-15T13:02:00') '05:02 PST boundary changed' }
    Set-Content (Join-Path $root 'ui-fable.log') 'no reset timestamp'
    $rejected = $false
    try { & ([scriptblock]::Create($wait.Extent.Text)) } catch { $rejected = $_.Exception.Message -match 'no verified reset timestamp' }
    Assert $rejected 'missing reset did not fail closed'
} finally {
    # root is an absolute, generated temporary test directory, never a production path.
    Remove-Item -LiteralPath $root -Recurse -Force
}
`;
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    env: { ...process.env, UI_SOURCE: fileURLToPath(source) },
    encoding: 'utf8', timeout: 30_000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('launch mutex excludes a second process and releases after an exception', {
  skip: process.platform !== 'win32' ? 'Windows named mutex' : false,
}, () => {
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', String.raw`
$ErrorActionPreference = 'Stop'
$tokens = $null; $errors = $null
$ast = [Management.Automation.Language.Parser]::ParseFile($env:UI_SOURCE, [ref]$tokens, [ref]$errors)
$text = $ast.Extent.Text
# Isolate the actual lock preamble and finally clause; no production paths are evaluated.
$start = $text.IndexOf('$uiMutex = New-Object')
$end = $text.IndexOf('try {', $text.IndexOf('if (-not $ownsUiMutex)', $start))
$lock = $text.Substring($start, $end - $start).Replace('Local\REDLINE-UI-GO', ('Local\REDLINE-UI-TEST-' + [Guid]::NewGuid().ToString('N')))
$release = $ast.EndBlock.Statements[-1].Finally.Extent.Text
if (-not $release) { throw 'missing finally block' }
$release = $release.Substring(1, $release.Length - 2)
. ([scriptblock]::Create($lock))
try {
    $name = [regex]::Match($lock, "'([^']+)'\)").Groups[1].Value
    $probe = '$m = New-Object Threading.Mutex($false, ''' + $name + '''); try { if ($m.WaitOne(0)) { $m.ReleaseMutex(); exit 1 } } finally { $m.Dispose() }; exit 0'
    & powershell.exe -NoProfile -NonInteractive -Command $probe
    if ($LASTEXITCODE -ne 0) { throw 'second process acquired launch lock' }
    throw 'TEST_EXCEPTION'
} catch { if ($_.Exception.Message -ne 'TEST_EXCEPTION') { throw } }
finally { . ([scriptblock]::Create($release)) }
$probe = '$m = New-Object Threading.Mutex($false, ''' + $name + '''); try { if (-not $m.WaitOne(0)) { exit 1 }; $m.ReleaseMutex() } finally { $m.Dispose() }; exit 0'
& powershell.exe -NoProfile -NonInteractive -Command $probe
if ($LASTEXITCODE -ne 0) { throw 'launch lock was not released' }
`], {
    env: { ...process.env, UI_SOURCE: fileURLToPath(source) },
    encoding: 'utf8', timeout: 30_000,
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test('launch lock and truthful mockup wording remain in the scheduled source', () => {
  const text = readFileSync(source, 'utf8');
  assert.ok(text.indexOf('$uiMutex.WaitOne(0)') < text.indexOf('if ($WaitForReset)'));
  assert.match(text, /finally\s*\{\s*if \(\$ownsUiMutex\) \{ \$uiMutex.ReleaseMutex\(\) \}/);
  assert.match(text, /AVAILABLE MOCKUPS \(approval unverified\)/);
  assert.doesNotMatch(text, /APPROVED VISUAL TARGET|ui@redline\.local|REDLINE UI run|Remove-Item/);
  assert.equal((text.match(/    Set-UiIdentity/g) || []).length, 2);
});
