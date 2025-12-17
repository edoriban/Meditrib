---
description: Guía de configuración para desarrollo local
---

# Setup de Entorno de Desarrollo (Local)

Esta guía te ayudará a configurar el proyecto `Meditrib` en tu máquina local para comenzar a desarrollar.

## Prerequisitos
-   Python 3.10 o superior
-   Node.js 18 o superior
-   pnpm (Recomendado) o npm
-   Git

## 1. Clonar y Preparar Repositorio
```bash
git clone <url-del-repo>
cd Meditrib
```

## 2. Configuración Backend (Python)
Recomendamos usar un entorno virtual.

```bash
# Crear entorno virtual
python -m venv venv

# Activar (Mac/Linux)
source venv/bin/activate
# Activar (Windows)
# venv\Scripts\activate

# Instalar dependencias
pip install -r backend/requirements.txt
```

### Base de Datos Local
Por defecto para desarrollo local, usamos **SQLite** (cero configuración).
La base de datos se creará automáticamente como `meditrib.db` en la raíz al correr la app.

Si quieres reinicializarla con datos de prueba:
```bash
# Establecer PYTHONPATH
export PYTHONPATH=$PYTHONPATH:.

# Ejecutar script de init
python backend/init_db.py
```

## 3. Configuración Frontend (React)
```bash
cd frontend
# Instalar dependencias
pnpm install
```

## 4. Correr la Aplicación (Modo Dev)
Puedes correr backend y frontend por separado o usar el script `run.py`.

### Opción A: Script Unificado (Recomendado)
Desde la raíz del proyecto:
```bash
python run.py
```
Esto levantará:
-   Backend en `http://localhost:8000` (con Hot Reload)
-   Frontend en `http://localhost:5173` (con Hot Reload)

### Opción B: Manual
**Terminal 1 (Backend):**
```bash
uvicorn backend.main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
pnpm dev
```
