# 🚀 Guía de Desarrollo - Sistema de Tickets

## 📋 Requisitos Previos

- **Node.js** (versión 18 o superior)
- **Python** (versión 3.8 o superior)
- **Visual Studio Code** (recomendado)

## 🛠️ Configuración Inicial

### 1. Instalar Dependencias

#### Frontend (Next.js)
```bash
npm install
```

#### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
```

## 🚀 Métodos de Inicio

### Opción 1: Scripts Automáticos (Recomendado)

#### Windows (Batch)
```bash
# Doble clic en el archivo o ejecutar desde terminal
start-dev.bat
```

#### PowerShell
```powershell
# Ejecutar desde PowerShell
./start-dev.ps1
```

### Opción 2: Visual Studio Code

#### Usando Tareas (Ctrl+Shift+P)
1. Abrir Command Palette: `Ctrl+Shift+P`
2. Escribir: `Tasks: Run Task`
3. Seleccionar: `Iniciar Desarrollo Completo`

#### Usando Debug (F5)
1. Ir a la pestaña Debug (Ctrl+Shift+D)
2. Seleccionar: `Iniciar Aplicación Completa`
3. Presionar F5 o hacer clic en el botón play

### Opción 3: Manual (Terminal Integrado)

#### Terminal 1 - Backend
```bash
cd backend
uvicorn main:app --reload --port 8001
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Documentación API**: http://localhost:8001/docs

## 🔧 Configuración de VS Code

### Extensiones Recomendadas
- Python
- Pylance
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (para probar APIs)

### Configuración Automática
El proyecto incluye configuración automática para VS Code:
- `.vscode/settings.json` - Configuración del editor
- `.vscode/tasks.json` - Tareas automatizadas
- `.vscode/launch.json` - Configuración de debug

## 🐛 Solución de Problemas

### Error: "Failed to fetch"
- Verificar que el backend esté ejecutándose en puerto 8001
- Comprobar que las variables de entorno estén configuradas

### Error: Puerto en uso
```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :3000
netstat -ano | findstr :8001

# Terminar proceso (reemplazar PID)
taskkill /PID <PID> /F
```

### Error: Módulos no encontrados
```bash
# Reinstalar dependencias frontend
rm -rf node_modules package-lock.json
npm install

# Reinstalar dependencias backend
cd backend
pip install -r requirements.txt --force-reinstall
```

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas de Next.js
├── components/             # Componentes React
├── backend/               # API FastAPI
│   ├── main.py           # Servidor principal
│   └── requirements.txt  # Dependencias Python
├── .vscode/              # Configuración VS Code
├── start-dev.bat         # Script Windows
├── start-dev.ps1         # Script PowerShell
└── .env.local           # Variables de entorno
```

## 🔐 Variables de Entorno

El archivo `.env.local` contiene:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
MONGODB_URI=mongodb://localhost:27017/qrtixpro
```

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Iniciar frontend
npm run build           # Construir para producción
npm run start           # Iniciar en producción

# Backend
uvicorn main:app --reload --port 8001  # Desarrollo
python main.py                         # Alternativo

# Linting y formato
npm run lint            # Verificar código
npm run prettier        # Verificar formato
```

## 🎯 Funcionalidades Principales

1. **Registro/Login de usuarios**
2. **Compra de entradas**
3. **Generación de PDF con QR**
4. **Gestión de eventos**
5. **Panel de administración**

---

💡 **Tip**: Para la mejor experiencia de desarrollo, usa VS Code con la configuración incluida y ejecuta `Iniciar Desarrollo Completo` desde las tareas.