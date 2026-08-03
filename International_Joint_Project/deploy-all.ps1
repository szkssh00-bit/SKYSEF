param(
  [string]$Message = "Update International Joint Project"
)

$ErrorActionPreference = "Stop"
$DeploymentId = "AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA"

Set-Location $PSScriptRoot

Write-Host "[0/7] Checking required commands..."
foreach ($Command in @("git", "clasp", "node")) {
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "$Command is not installed or is not available in PATH."
  }
}

$RepoRoot = git rev-parse --show-toplevel
if (-not $RepoRoot) {
  throw "This folder is not inside the SKYSEF Git repository."
}

Write-Host "[1/7] Checking browser JavaScript syntax..."
$HtmlText = Get-Content -LiteralPath (Join-Path $PSScriptRoot "Index.html") -Raw
$Match = [regex]::Match($HtmlText, "<script>([\s\S]*)</script>")
if (-not $Match.Success) {
  throw "The JavaScript block was not found in Index.html."
}

$TempJs = Join-Path $env:TEMP ("ijp_check_" + [guid]::NewGuid().ToString() + ".js")
Set-Content -LiteralPath $TempJs -Value $Match.Groups[1].Value -Encoding UTF8
try {
  node --check $TempJs
} finally {
  Remove-Item -LiteralPath $TempJs -Force -ErrorAction SilentlyContinue
}

Write-Host "[2/7] Checking Apps Script upload files..."
clasp show-file-status

Write-Host "[3/7] Pushing GAS API source..."
clasp push --force

Write-Host "[4/7] Updating the existing GAS Web App deployment..."
clasp update-deployment $DeploymentId --description $Message

Write-Host "[5/7] Staging GitHub files..."
git -C $RepoRoot add International_Joint_Project

Write-Host "[6/7] Committing GitHub changes..."
$Pending = git -C $RepoRoot status --porcelain
if ($Pending) {
  git -C $RepoRoot commit -m $Message
} else {
  Write-Host "No Git changes to commit."
}

Write-Host "[7/7] Pushing GitHub main branch..."
git -C $RepoRoot push origin main

Write-Host ""
Write-Host "=============================================="
Write-Host "UPDATE COMPLETED"
Write-Host "GitHub Pages:"
Write-Host "https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/Index.html"
Write-Host "GAS API:"
Write-Host "https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec?api=status"
Write-Host "=============================================="
