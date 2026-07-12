@echo off
title BMT - Publicar demo
cd /d "C:\Users\User\source\repos\bali-moto-track"

echo ============================================
echo   BALI MOTO TRACK - publicando demo online
echo ============================================
echo.
echo 1) Arrancando servidores (web + API)...
start "BMT servidores" cmd /k "pnpm dev"

echo 2) Esperando a que levanten (10s)...
timeout /t 10 /nobreak >nul

echo 3) Abriendo el tunel publico...
start "BMT tunel - AQUI SALE EL LINK" cmd /k ""C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173"

echo.
echo ============================================
echo   LISTO. Se abrieron 2 ventanas:
echo    - "BMT servidores"  (dejala abierta)
echo    - "BMT tunel"       (ahi aparece el LINK https://...trycloudflare.com)
echo.
echo   Para mostrar: entra con  mrrental / bali123
echo   Para apagar: cerra las 2 ventanas.
echo ============================================
echo.
pause
