@echo off
setlocal
cd /d "%~dp0"

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Add selectable back camera"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-all.ps1" -Message "%MESSAGE%"

if errorlevel 1 (
  echo.
  echo UPDATE FAILED.
  pause
  exit /b 1
)

echo.
echo UPDATE COMPLETED SUCCESSFULLY.
pause
