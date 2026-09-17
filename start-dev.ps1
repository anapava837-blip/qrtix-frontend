# Script para iniciar el entorno de desarrollo completo
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INICIANDO ENTORNO DE DESARROLLO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar si Python está instalado
try {
    $pythonVersion = python --version
    Write-Host "[✓] Python detectado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Error: Python no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/3] Iniciando Backend (Puerto 8001)..." -ForegroundColor Yellow

# Iniciar backend en una nueva ventana de PowerShell
$backendPath = Join-Path $PSScriptRoot "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; uvicorn main:app --reload --port 8000" -WindowStyle Normal

Write-Host "[2/3] Esperando 3 segundos para que el backend se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "[3/3] Iniciando Frontend (Puerto 3000)..." -ForegroundColor Yellow

# Iniciar frontend en una nueva ventana de PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   SERVIDORES INICIADOS CORRECTAMENTE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8001" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")