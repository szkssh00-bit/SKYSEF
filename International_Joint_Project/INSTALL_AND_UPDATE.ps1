param(
  [Parameter(Mandatory=$true)]
  [string]$ZipPath,

  [string]$RepoPath =
    "C:\Users\fuchigami.yuta\Documents\GitHub\SKYSEF",

  [string]$Message =
    "Align Live challenge title heights"
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
$Backup = Join-Path $RepoPath (
  "International_Joint_Project_backup_" +
  (Get-Date -Format "yyyyMMdd_HHmmss")
)

try {
  Write-Host "[1/4] Extracting ZIP..."
  Expand-Archive -LiteralPath $ZipPath -DestinationPath $Temp -Force

  $Source = Join-Path $Temp "International_Joint_Project"

  if (-not (Test-Path -LiteralPath $Source)) {
    throw "International_Joint_Project was not found inside the ZIP."
  }

  Write-Host "[2/4] Creating backup copy..."
  if (Test-Path -LiteralPath $Target) {
    New-Item -ItemType Directory -Path $Backup -Force | Out-Null

    & robocopy $Target $Backup /E /COPY:DAT /R:2 /W:1 /NFL /NDL /NJH /NJS

    if ($LASTEXITCODE -ge 8) {
      throw "Backup robocopy failed with exit code $LASTEXITCODE."
    }
  }

  Write-Host "[3/4] Updating project files in place..."
  New-Item -ItemType Directory -Path $Target -Force | Out-Null

  & robocopy $Source $Target /MIR /COPY:DAT /R:3 /W:2 /NFL /NDL /NJH /NJS

  if ($LASTEXITCODE -ge 8) {
    throw "Project update robocopy failed with exit code $LASTEXITCODE."
  }

} finally {
  if (Test-Path -LiteralPath $Temp) {
    Remove-Item -LiteralPath $Temp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "[4/4] Updating GAS and GitHub..."
Set-Location $Target
& ".\UPDATE_ALL.cmd" $Message

if ($LASTEXITCODE -ne 0) {
  throw "UPDATE_ALL.cmd failed."
}
