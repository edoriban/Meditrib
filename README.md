# Meditrib

Sistema de gestión integral para farmacias, diseñado para manejar inventario, pedidos, ventas, proveedores y programación de surtido de medicamentos. Permite medir y controlar todas las operaciones para optimizar la gestión y facilitar el trabajo diario del personal.

## Características Principales

- **Gestión de Inventario**: Control completo de medicamentos, incluyendo etiquetas, stock y alertas.
- **Proveedores y Pedidos**: Administración de proveedores y órdenes de compra.
- **Ventas y Clientes**: Registro de ventas, gestión de clientes y historial de transacciones.
- **Reportes**: Generación de reportes en PDF y Excel para análisis y toma de decisiones.
- **Autenticación y Roles**: Sistema de usuarios con roles para controlar accesos.
- **Interfaz Responsive**: Optimizada para desktop y dispositivos móviles, permitiendo gestión desde cualquier lugar.

## Arquitectura del Proyecto

Este proyecto sigue una arquitectura cliente-servidor:

- **Backend**: API REST desarrollada con FastAPI (Python), utilizando SQLAlchemy para la persistencia de datos, autenticación JWT y generación de reportes.
- **Frontend**: Aplicación web moderna construida con React, TypeScript y Vite, con una interfaz de usuario responsive usando Tailwind CSS y componentes de Radix UI.
- **Base de Datos**: SQLite para desarrollo (fácilmente configurable para PostgreSQL u otros motores en producción).

## Instalación y Ejecución

### Prerrequisitos

- Python 3.8+
- Node.js 16+
- pnpm (recomendado) o npm

### Pasos de Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   cd Meditrib
   ```

2. Instala dependencias del backend:
   ```bash
   pip install -r requirements.txt
   ```

3. Instala dependencias del frontend:
   ```bash
   cd frontend
   pnpm install
   cd ..
   ```

4. Ejecuta ambos servicios simultáneamente:
   ```bash
   python run.py
   ```

   Esto iniciará:
   - Backend en `http://localhost:8000` (API con documentación en `/docs`)
   - Frontend en `http://localhost:5173`

### Configuración Inicial

- La base de datos se crea automáticamente al iniciar el backend.
- Registra un usuario administrador desde el frontend para comenzar.

## Uso

1. Accede al frontend desde tu navegador.
2. Registra una cuenta o inicia sesión.
3. Navega por las secciones disponibles:
   - Dashboard: Vista general con métricas clave.
   - Medicamentos: Gestión del inventario.
   - Usuarios: Administración de usuarios y roles.
   - (Próximamente: Ventas, Clientes, Proveedores, Reportes)

## Tecnologías Utilizadas

### Backend
- FastAPI: Framework web moderno y rápido.
- SQLAlchemy: ORM para base de datos.
- Uvicorn: Servidor ASGI.
- Pandas/OpenPyXL/ReportLab: Para generación de reportes.
- PassLib/PyJWT: Autenticación segura.

### Frontend
- React 18: Biblioteca para interfaces de usuario.
- TypeScript: Tipado estático para JavaScript.
- Vite: Herramienta de construcción rápida.
- Tailwind CSS: Framework CSS utilitario.
- Radix UI: Componentes primitivos accesibles.
- React Query: Gestión de estado del servidor.
- React Router: Navegación del lado cliente.

## Estructura del Proyecto

```
Meditrib/
├── backend/          # API FastAPI
│   ├── core/         # Lógica central (modelos, esquemas, BD)
│   ├── crud/         # Operaciones de base de datos
│   ├── routers/      # Endpoints de la API
│   ├── reports/      # Generación de reportes
│   └── main.py       # Punto de entrada
├── frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas de la aplicación
│   │   ├── hooks/       # Hooks personalizados
│   │   └── types/       # Definiciones TypeScript
│   └── package.json
├── requirements.txt  # Dependencias Python
├── run.py           # Script para ejecutar ambos servicios
└── README.md        # Este archivo
```

## Desarrollo

Para contribuir o modificar:

- El backend incluye documentación automática en `/docs` cuando está ejecutándose.
- El frontend usa ESLint para mantener la calidad del código.
- Las rutas del frontend están protegidas con autenticación.

## Próximas Implementaciones

- Páginas completas para Ventas, Clientes, Proveedores y Reportes.
- Mejoras en la responsividad móvil.
- Notificaciones push para alertas de inventario.
- Exportación de datos en más formatos.

## Licencia

Este proyecto es privado y está destinado para uso interno de la farmacia.</content>
<parameter name="filePath">/Users/eolivan/Projects/EO/Meditrib/README.md