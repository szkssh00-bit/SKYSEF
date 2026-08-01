param(
  [string]$ZipPath = "C:\Users\fuchigami.yuta\Downloads\International_Joint_Project_GitHub_API.zip",
  [string]$RepoPath = "C:\Users\fuchigami.yuta\Documents\GitHub\SKYSEF",
  [string]$Message = "Update International Joint Project"
)

$ErrorActionPreference = "Stop"

$Target =
  Join-Path $RepoPath "International_Joint_Project"

$Temp =
  Join-Path $env:TEMP (
    "IJP_" +
    [guid]::NewGuid().ToString()
  )

Expand-Archive `
  -LiteralPath $ZipPath `
  -DestinationPath $Temp `
  -Force

$Source =
  Join-Path $Temp "International_Joint_Project"

if (-not (Test-Path $Source)) {
  throw "International_Joint_Project was not found inside the ZIP."
}

if (Test-Path $Target) {
  $Backup =
    $Target +
    "_backup_" +
    (Get-Date -Format "yyyyMMdd_HHmmss")

  Move-Item `
    -LiteralPath $Target `
    -Destination $Backup
}

Move-Item `
  -LiteralPath $Source `
  -Destination $Target

Remove-Item `
  -LiteralPath $Temp `
  -Recurse `
  -Force

Set-Location $Target

& ".\deploy-all.cmd" $Message
