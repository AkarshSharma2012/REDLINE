param(
  [Parameter(Mandatory=$true)][ValidateSet('report','watch','doctor','probe')][string]$Command,
  [Parameter(Mandatory=$true)][string]$StateDir,
  [string]$InputFile
)
$ErrorActionPreference = 'Stop'
$entry = Join-Path $PSScriptRoot 'failure-watchdog.mjs'
if ($InputFile) { & node $entry $Command $StateDir $InputFile }
else { & node $entry $Command $StateDir }
exit $LASTEXITCODE
