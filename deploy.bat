@echo off
REM ============================================================
REM  tuveuxun.expert - Mise en ligne du site (double-clic)
REM  Rebuild le front et le pousse sur le KVM 2 via Traefik.
REM  Pre-requis : cle SSH deja en place (deja fait le 14/09).
REM ============================================================
cd /d "%~dp0"
echo.
echo   Mise en ligne de tuveuxun.expert ...
echo.
bash deploy-traefik/deploy-online.sh
echo.
echo   Termine. Appuie sur une touche pour fermer.
pause >nul
