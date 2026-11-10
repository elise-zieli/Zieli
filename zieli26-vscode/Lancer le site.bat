@echo off
rem Lance le serveur local puis ouvre le site dans le navigateur.
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000/"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serveur.ps1"
pause
