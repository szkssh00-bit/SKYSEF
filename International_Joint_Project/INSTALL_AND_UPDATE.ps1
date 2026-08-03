param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath,

  [string]$RepoPath = "C:\Users\fuchigami.yuta\Documents\GitHub\SKYSEF",

  [string]$Message = "Update International Joint Project"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $ZipPath)) {
  throw "ZIP file not found: $ZipPath"
}

if (-not (Test-Path -LiteralPath $RepoPath)) {
  throw "Git repository not found: $RepoPath"
}

$Target = Join-Path $RepoPath "International_Joint_Project"
$Temp = Join-Path $env:TEMP ("IJP_" + [guid]::NewGuid().ToString())

try {
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $Temp -Force

  $Source = Join-Path $Temp "International_Joint_Project"

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "International_Joint_Project folder was not found inside the ZIP."
  }

  if (Test-Path -LiteralPath $Target) {
    $Backup = $Target + "_backup_" + (Get-Date -Format "yyyyMMdd_HHmmss")
    Move-Item -LiteralPath $Target -Destination $Backup
    Write-Host "Backup created: $Backup"
  }

  Move-Item -LiteralPath $Source -Destination $Target

} finally {
  if (Test-Path -LiteralPath $Temp) {
    Remove-Item -LiteralPath $Temp -Recurse -Force
  }
}

Set-Location $Target
& ".\UPDATE_ALL.cmd" $Message

if ($LASTEXITCODE -ne 0) {
  throw "UPDATE_ALL.cmd failed."
}
