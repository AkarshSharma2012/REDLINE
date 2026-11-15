param([Parameter(Mandatory=$true)][string]$StateDir)
$ErrorActionPreference = 'Stop'
# Plain structured display; never render log text as commands or terminal markup.
& node (Join-Path $PSScriptRoot 'failure-watchdog.mjs') doctor $StateDir
exit $LASTEXITCODE
