@echo off
title MyBusOps
cd /d "%~dp0"

echo ========================================
echo        RIOJACAR MYBUSOPS
echo ========================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado o npm no esta en PATH.
    echo Instala Node.js LTS desde https://nodejs.org
    pause
    exit /b
)

if not exist node_modules (
    echo Instalando dependencias por primera vez...
    call npm install --no-audit --no-fund
    if errorlevel 1 (
        echo ERROR instalando dependencias.
        pause
        exit /b
    )
)

if not exist node_modules\.bin\concurrently.cmd (
    echo Instalando concurrently...
    call npm install concurrently --save-dev --no-audit --no-fund
    if errorlevel 1 (
        echo ERROR instalando concurrently.
        pause
        exit /b
    )
)

echo.
echo Iniciando FleetOps...
echo Abre Chrome en: http://localhost:5173
echo.
call npm run dev:all
pause
