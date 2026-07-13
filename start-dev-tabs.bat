@echo off
setlocal

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"
set "YOLO=%ROOT%flask"
set "CHATBOT=%ROOT%chatbot-flask"
set "FLASK_COMMAND=conda run --no-capture-output -n pknu_skin python"

where conda.exe >nul 2>nul
if errorlevel 1 set "FLASK_COMMAND=python"

where wt.exe >nul 2>nul
if errorlevel 1 (
    echo Windows Terminal wt.exe was not found. Opening 3 cmd windows instead.
    start "backend bootRun" /D "%BACKEND%" cmd /k "call gradlew.bat bootRun"
    start "frontend npm start" /D "%FRONTEND%" cmd /k "npm start"
    start "YOLO Flask (pknu_skin)" /D "%YOLO%" cmd /k "%FLASK_COMMAND% app.py"
    start "chatbot Flask (pknu_skin)" /D "%CHATBOT%" cmd /k "%FLASK_COMMAND% app.py"
    start "backend classes -t" /D "%BACKEND%" cmd /k "call gradlew.bat classes -t"
    exit /b
)

wt.exe new-tab --title "backend bootRun" -d "%BACKEND%" cmd /k "call gradlew.bat bootRun" ; new-tab --title "frontend npm start" -d "%FRONTEND%" cmd /k "npm start" ; new-tab --title "YOLO Flask (pknu_skin)" -d "%YOLO%" cmd /k "%FLASK_COMMAND% app.py" ; new-tab --title "chatbot Flask (pknu_skin)" -d "%CHATBOT%" cmd /k "%FLASK_COMMAND% app.py" ; new-tab --title "backend classes -t" -d "%BACKEND%" cmd /k "call gradlew.bat classes -t"
