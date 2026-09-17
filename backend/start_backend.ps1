# Script para iniciar el backend de QRTIXPRO
# Este script activa el entorno virtual y ejecuta el servidor FastAPI

Write-Host "Iniciando backend de QRTIXPRO..." -ForegroundColor Green

# Verificar si estamos en el directorio correcto
if (-not (Test-Path "main.py")) {
    Write-Host "Error: No se encontro main.py. Asegurate de estar en el directorio backend." -ForegroundColor Red
    exit 1
}

# Verificar si existe el entorno virtual
if (-not (Test-Path ".venv")) {
    Write-Host "Error: No se encontro el entorno virtual (.venv)." -ForegroundColor Red
    Write-Host "Ejecuta: python -m venv .venv" -ForegroundColor Yellow
    exit 1
}

# Activar el entorno virtual
Write-Host "Activando entorno virtual..." -ForegroundColor Yellow
& ".\.venv\Scripts\Activate.ps1"

# Verificar si las dependencias están instaladas
Write-Host "Verificando dependencias..." -ForegroundColor Yellow
$dotenvInstalled = pip list | Select-String "python-dotenv"
if (-not $dotenvInstalled) {
    Write-Host "Instalando dependencias..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Iniciar el servidor
Write-Host "Iniciando servidor FastAPI en http://localhost:8000..." -ForegroundColor Green
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Cyan
uvicorn main:app --reload --host 0.0.0.0 --port 8000