@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

where wt.exe >nul 2>nul
if errorlevel 1 (
    echo Windows Terminal wt.exe was not found. Opening 3 cmd windows instead.
    start "backend bootRun" /D "%BACKEND%" cmd /k "call gradlew.bat bootRun"
    start "frontend npm start" /D "%FRONTEND%" cmd /k "npm start"
    start "backend classes -t" /D "%BACKEND%" cmd /k "call gradlew.bat classes -t"
    exit /b
)

wt.exe new-tab --title "backend bootRun" -d "%BACKEND%" cmd /k "call gradlew.bat bootRun" ; new-tab --title "frontend npm start" -d "%FRONTEND%" cmd /k "npm start" ; new-tab --title "backend classes -t" -d "%BACKEND%" cmd /k "call gradlew.bat classes -t"
