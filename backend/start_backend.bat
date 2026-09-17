@echo off
echo 🚀 Iniciando backend de QRTIXPRO...

REM Verificar si estamos en el directorio correcto
if not exist "main.py" (
    echo ❌ Error: No se encontró main.py. Asegúrate de estar en el directorio backend.
    pause
    exit /b 1
)

REM Verificar si existe el entorno virtual
if not exist ".venv" (
    echo ❌ Error: No se encontró el entorno virtual (.venv).
    echo 💡 Ejecuta: python -m venv .venv
    pause
    exit /b 1
)

REM Activar el entorno virtual
echo 🔧 Activando entorno virtual...
call .venv\Scripts\activate.bat

REM Verificar e instalar dependencias si es necesario
echo 📦 Verificando dependencias...
pip list | findstr "python-dotenv" >nul
if errorlevel 1 (
    echo 📥 Instalando dependencias...
    pip install -r requirements.txt
)

REM Iniciar el servidor
echo 🌐 Iniciando servidor FastAPI en http://localhost:8000...
echo ⏹️  Presiona Ctrl+C para detener el servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000

pause