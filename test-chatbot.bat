@echo off
REM ===========================================================
REM  tuveuxun.expert - Test du chatbot
REM  Double-clic. Verifie que l agent Tv1E est fonctionnel
REM  et intelligent : factuel, hors-sujet, jailbreak.
REM  Prerequis : start.bat deja lance.
REM ===========================================================
setlocal EnableExtensions
cd /d "%~dp0"

set "VENV=%~dp0backend\venv"

if exist "%VENV%\Scripts\python.exe" goto run
echo [ERREUR] Venv backend absent. Lance d abord start.bat.
timeout /t 6 /nobreak >nul
exit /b 1

:run
"%VENV%\Scripts\python.exe" "%~dp0backend\test_bot.py"

echo.
echo Appuie sur une touche pour fermer.
pause >nul
endlocal
