param(
  [string]$Message = "Reduce Live team and result font sizes"
)

$ErrorActionPreference = "Stop"
$DeploymentId = "AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA"

function Invoke-Native {
  param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,

    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
  )

  & $FilePath @Arguments

  if ($LASTEXITCODE -ne 0) {
    throw "$FilePath failed with exit code $LASTEXITCODE."
  }
}

Set-Location $PSScriptRoot

Write-Host "[0/8] Checking required commands..."
foreach ($Command in @("git", "clasp", "node")) {
  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "$Command is not installed or is not available in PATH."
  }
}

$RepoRoot = (& git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0 -or -not $RepoRoot) {
  throw "This folder is not inside the SKYSEF Git repository."
}

Write-Host "[1/8] Checking browser JavaScript syntax..."
$IndexPath = Join-Path $PSScriptRoot "Index.html"
$HtmlText = Get-Content -LiteralPath $IndexPath -Raw -Encoding UTF8
$Match = [regex]::Match($HtmlText, "<script>([\s\S]*)</script>")

if (-not $Match.Success) {
  throw "The JavaScript block was not found in Index.html."
}

$TempJs = Join-Path $env:TEMP ("ijp_check_" + [guid]::NewGuid().ToString() + ".js")

try {
  [System.IO.File]::WriteAllText(
    $TempJs,
    $Match.Groups[1].Value,
    [System.Text.UTF8Encoding]::new($false)
  )
  Invoke-Native node --check $TempJs
} finally {
  Remove-Item -LiteralPath $TempJs -Force -ErrorAction SilentlyContinue
}

Write-Host "[2/8] Checking Apps Script upload files..."
Invoke-Native clasp show-file-status

Write-Host "[3/8] Pushing GAS API source..."
Invoke-Native clasp push --force

Write-Host "[4/8] Updating the existing GAS deployment..."
Invoke-Native clasp update-deployment $DeploymentId --description $Message

Write-Host "[5/8] Staging GitHub files..."
Invoke-Native git -C $RepoRoot add International_Joint_Project

Write-Host "[6/8] Committing local changes..."
$Pending = git -C $RepoRoot status --porcelain
if ($LASTEXITCODE -ne 0) {
  throw "git status failed."
}

if ($Pending) {
  Invoke-Native git -C $RepoRoot commit -m $Message
} else {
  Write-Host "No local Git changes to commit."
}

Write-Host "[7/8] Integrating remote main branch..."
Invoke-Native git -C $RepoRoot pull --rebase origin main

Write-Host "[8/8] Pushing GitHub main branch..."
Invoke-Native git -C $RepoRoot push origin main

Write-Host ""
Write-Host "=============================================="
Write-Host "UPDATE COMPLETED SUCCESSFULLY"
Write-Host "GitHub Pages:"
Write-Host "https://szkssh00-bit.github.io/SKYSEF/International_Joint_Project/Index.html"
Write-Host "GAS API:"
Write-Host "https://script.google.com/macros/s/AKfycbxCP7Yb2_xw6PRdPOiFhRAMokDA9OEmR12fHjn57I5Mz_BGxF3_Nv8XYrf95xWKB-WrpA/exec?api=status"
Write-Host "=============================================="
