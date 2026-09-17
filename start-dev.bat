@echo off
echo ========================================
echo    INICIANDO ENTORNO DE DESARROLLO
echo ========================================
echo.

echo [1/3] Iniciando Backend (Puerto 8001)...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "uvicorn main:app --reload --port 8000"

echo [2/3] Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo [3/3] Iniciando Frontend (Puerto 3000)...
cd /d "%~dp0"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   SERVIDORES INICIADOS CORRECTAMENTE
echo ========================================
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8001
echo ========================================
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul