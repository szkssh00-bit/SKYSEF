param(
  [string]$Message = "Update International Joint Project"
)

$ErrorActionPreference = "Stop"
$DeploymentId = "AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA"

Set-Location $PSScriptRoot

$RepoRoot = git rev-parse --show-toplevel
if (-not $RepoRoot) {
  throw "This folder is not inside the SKYSEF Git repository."
}

Write-Host "[1/5] Push GAS API source"
clasp push --force

Write-Host "[2/5] Update existing GAS API deployment"
clasp update-deployment $DeploymentId --description $Message

Write-Host "[3/5] Stage GitHub files"
git -C $RepoRoot add International_Joint_Project

Write-Host "[4/5] Commit GitHub changes"
$Pending = git -C $RepoRoot status --porcelain
if ($Pending) {
  git -C $RepoRoot commit -m $Message
} else {
  Write-Host "No Git changes to commit."
}

Write-Host "[5/5] Push GitHub main"
git -C $RepoRoot push origin main

Write-Host ""
Write-Host "Completed."
Write-Host "GitHub Pages:"
Write-Host "https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/"
Write-Host "GAS API:"
Write-Host "https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec?api=status"
