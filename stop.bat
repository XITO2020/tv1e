@echo off
REM ===========================================================
REM  tuveuxun.expert - Arret
REM  Ferme le backend chatbot 8001 et le site, quel que soit le
REM  port que Next a pris : 3000, ou 3001 / 3002 si 3000 etait occupe.
REM  Ne touche PAS a Ollama ni a ComfyUI.
REM ===========================================================
setlocal EnableExtensions

echo.
echo ========================================
echo   tuveuxun.expert - Arret
echo ========================================
echo.

taskkill /FI "WINDOWTITLE eq tuveuxun-BACKEND-8001*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq tuveuxun-SITE*" /T /F >nul 2>&1

REM Le site est coupe par le titre de sa fenetre uniquement : un balayage
REM des ports 3000-3002 tuerait studio-ai quand il tourne sur 3000.
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8001" ^| findstr LISTENING') do taskkill /PID %%P /F >nul 2>&1

echo [OK] Backend 8001 et site arretes.
echo [i]  Ollama reste actif - c est voulu.
echo.
timeout /t 4 /nobreak >nul
endlocal
