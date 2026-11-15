param(
  [Parameter(Mandatory=$true)][string]$StateDir,
  [string]$UpstreamStateDir
)
$ErrorActionPreference = 'Stop'
# Plain structured display; never render log text as commands or terminal markup.
if ($UpstreamStateDir) { & node (Join-Path $PSScriptRoot 'failure-watchdog.mjs') doctor $StateDir $UpstreamStateDir }
else { & node (Join-Path $PSScriptRoot 'failure-watchdog.mjs') doctor $StateDir }
exit $LASTEXITCODE
