@echo off
title Publicar ConanGo en Vercel (Enlace Permanente 24/7)
color 0B
echo ===================================================================
echo               PUBLICAR CONANGO EN LA NUBE (VERCEL)
echo ===================================================================
echo.
echo Este asistente te conectara con Vercel para subir tu aplicacion
echo y generar tu enlace permanente con candado SSL gratis (https).
echo.
echo [PASO 1] Te preguntara como iniciar sesion (GitHub o Correo).
echo [PASO 2] Si eliges Correo, revisa tu email y haz clic en "Verify".
echo [PASO 3] Presiona [ENTER] a todas las preguntas para usar las opciones recomendadas.
echo.
echo ===================================================================
echo.
cd /d "C:\Users\pablo\.gemini\antigravity\scratch\ConanGo"
set NODE_TLS_REJECT_UNAUTHORIZED=0
call npx vercel
echo.
echo ===================================================================
echo   Proceso finalizado. Copia tu enlace de arriba para compartirlo.
echo ===================================================================
pause
