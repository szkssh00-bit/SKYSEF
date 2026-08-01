param(
  [string]$Message = "Update International Joint Project"
)

$ErrorActionPreference = "Stop"
$DeploymentId = "AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA"

Set-Location $PSScriptRoot

Write-Host "[1/6] Checking Git repository..."
$RepoRoot = git rev-parse --show-toplevel
if (-not $RepoRoot) {
  throw "This folder is not inside the SKYSEF Git repository."
}

Write-Host "[2/6] Checking files sent to Apps Script..."
clasp show-file-status

Write-Host "[3/6] Pushing source to Apps Script..."
clasp push --force

Write-Host "[4/6] Updating the existing Web App deployment..."
clasp update-deployment $DeploymentId --description $Message

Write-Host "[5/6] Committing Git changes..."
git -C $RepoRoot add International_Joint_Project

$Pending = git -C $RepoRoot status --porcelain
if ($Pending) {
  git -C $RepoRoot commit -m $Message
} else {
  Write-Host "No Git changes to commit."
}

Write-Host "[6/6] Pushing GitHub main branch..."
git -C $RepoRoot push origin main

Write-Host ""
Write-Host "Completed."
Write-Host "GitHub Pages:"
Write-Host "https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/Index.html"
Write-Host "GAS Web App:"
Write-Host "https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec"
