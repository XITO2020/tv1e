@echo off
REM ===========================================================
REM  tuveuxun.expert - Lanceur
REM  Double-clic. Lance le backend chatbot 8001 + le site.
REM  Prerequis : Ollama demarre.
REM
REM  03/09/2026 : modele 14B par defaut en local (8/8 aux tests de
REM  raisonnement, le 7B refuse des prestations de sa propre FAQ),
REM  temperature 0.3 validee sur 3 runs, et PRECHAUFFAGE du modele :
REM  sans lui, la premiere question d un visiteur attendait 45 a 110 s.
REM ===========================================================
setlocal EnableExtensions
cd /d "%~dp0"

set "PYTHON=C:\Users\naimd\anaconda3\python.exe"
set "VENV=%~dp0backend\venv"

REM --- Modele et reglages du chatbot en LOCAL ---
REM Sur le VPS ces variables viennent de l environnement du service, pas d ici.
set "BOT_MODEL=qwen2.5:14b-instruct-q5_K_M"
set "BOT_TEMPERATURE=0.3"

echo.
echo ========================================
echo   tuveuxun.expert - Demarrage
echo ========================================
echo.

REM --- 1. Ollama joignable ? ---
curl -s -o nul -m 3 http://127.0.0.1:11434/api/tags
if errorlevel 1 goto no_ollama
echo [OK] Ollama repond sur 11434
goto ollama_ok

:no_ollama
echo [ATTENTION] Ollama ne repond pas sur le port 11434.
echo Le chatbot basculera en mode FAQ hors-ligne.
echo Pour l activer : ouvre un terminal et tape   ollama serve
echo.

:ollama_ok

REM --- 2. Venv Python du backend ---
if exist "%VENV%\Scripts\python.exe" goto venv_ok
echo [..] Creation du venv Python du backend, patiente
"%PYTHON%" -m venv "%VENV%"
"%VENV%\Scripts\python.exe" -m pip install --upgrade pip --quiet
"%VENV%\Scripts\python.exe" -m pip install -r "%~dp0backend\requirements.txt" --quiet
echo [OK] Venv backend pret
goto venv_done

:venv_ok
echo [OK] Venv backend deja present

:venv_done

REM --- 3. Dependances du site ---
if exist "%~dp0node_modules" goto node_ok
echo [..] Installation des dependances du site, patiente
call npm install
goto node_done

:node_ok
echo [OK] node_modules deja present

:node_done

REM --- 4. Un ancien backend traine-t-il sur 8001 ? On le coupe. ---
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8001" ^| findstr "LISTENING"') do taskkill /PID %%p /F >nul 2>&1

echo.
echo [..] Ouverture de 2 fenetres : backend 8001 et site
echo.

start "tuveuxun-BACKEND-8001" cmd /k ""%VENV%\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8001 --app-dir "%~dp0backend""
timeout /t 3 /nobreak >nul
start "tuveuxun-SITE" cmd /k "npm run dev"

REM --- 5. Prechauffage : on charge le modele MAINTENANT, pas a la premiere question ---
echo [..] Chargement du modele %BOT_MODEL% en memoire, environ 1 minute
timeout /t 8 /nobreak >nul
curl -s -o nul -m 240 -X POST http://127.0.0.1:8001/chat -H "Content-Type: application/json" -d "{\"question\":\"Bonjour\"}"
if errorlevel 1 goto warm_ko
echo [OK] Modele charge : le chatbot repond maintenant en 2 a 5 secondes
goto warm_done

:warm_ko
echo [ATTENTION] Le prechauffage n a pas abouti. Le chatbot chargera le modele a la premiere question.

:warm_done

echo.
echo ========================================
echo   Pret.
echo   Site    : regarde la fenetre tuveuxun-SITE, Next affiche son port
echo             3000 en general, 3001 ou 3002 si 3000 est deja pris par studio-ai
echo   Chatbot : http://127.0.0.1:8001/health
echo   Pour tout arreter : double-clic sur stop.bat
echo ========================================
echo.
timeout /t 8 /nobreak >nul
endlocal
