@echo off
setlocal
cd /d "%~dp0"

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Update International Joint Project"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-all.ps1" -Message "%MESSAGE%"

if errorlevel 1 (
  echo.
  echo Deployment failed.
  exit /b 1
)

echo.
echo Deployment completed successfully.
