@echo off
setlocal
cd /d "%~dp0"

set "MESSAGE=%~1"
if "%MESSAGE%"=="" set "MESSAGE=Update International Joint Project"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-all.ps1" -Message "%MESSAGE%"

if errorlevel 1 (
  echo.
  echo UPDATE FAILED. Nothing after the failed step was treated as successful.
  pause
  exit /b 1
)

echo.
echo UPDATE COMPLETED SUCCESSFULLY.
pause
