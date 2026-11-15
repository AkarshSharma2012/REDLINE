param(
  [Parameter(Mandatory=$true)][ValidateSet('report','watch','doctor','probe')][string]$Command,
  [Parameter(Mandatory=$true)][string]$StateDir,
  [string]$InputFile,
  [string]$Cutoff
)
$ErrorActionPreference = 'Stop'
$entry = Join-Path $PSScriptRoot 'failure-watchdog.mjs'
if ($Cutoff) { & node $entry $Command $StateDir $InputFile $Cutoff }
elseif ($InputFile) { & node $entry $Command $StateDir $InputFile }
else { & node $entry $Command $StateDir }
exit $LASTEXITCODE
