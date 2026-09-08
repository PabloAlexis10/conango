@echo off
title ConanGo - Actualizar en Vercel
echo ========================================================
echo         ConanGo - Publicar Actualizacion en Vercel
echo ========================================================
echo.
echo 1. Guardando cambios locales...
git add .
echo.
set /p commitMsg="Introduce una descripcion del cambio (o presiona ENTER): "
if "%commitMsg%"=="" set commitMsg=Actualizacion de ConanGo

echo.
echo 2. Guardando version (commit)...
git commit -m "%commitMsg%"
echo.
echo 3. Enviando a GitHub y actualizando Vercel...
git push origin main
echo.
echo ========================================================
echo   Listo! Vercel esta actualizando tu app en la nube.
echo   En 45 segundos tus usuarios veran los cambios en su link.
echo ========================================================
pause
