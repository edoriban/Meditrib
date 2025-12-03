# Meditrib

Sistema de gestión integral para farmacias, diseñado para manejar inventario, pedidos, ventas, proveedores, facturación electrónica y programación de surtido de medicamentos. Permite medir y controlar todas las operaciones para optimizar la gestión y facilitar el trabajo diario del personal.

## ✅ Características Implementadas

### 📦 Gestión de Inventario
- **Medicamentos**: CRUD completo con campos fiscales (clave SAT, IVA por producto)
- **Etiquetas/Tags**: Categorización de medicamentos
- **Alertas automáticas**: Stock bajo, stock crítico, productos próximos a caducar
- **Lotes**: Control de lotes con fecha de caducidad y número de lote
- **Imágenes**: Subida y visualización de imágenes de productos

### 🏢 Proveedores y Órdenes de Compra
- **Proveedores**: CRUD completo con información de contacto
- **Órdenes de compra**: Creación, seguimiento y recepción de pedidos
- **Estados**: Flujo de estados (pendiente, en proceso, recibido, cancelado)

### 💰 Ventas y Facturación
- **Ventas**: Registro con múltiples productos, descuentos y tipos de documento
- **Notas de Remisión**: Ventas sin IVA para entregas
- **Facturas (CFDI)**: Generación de facturas con IVA por producto
- **Conversión**: Convertir remisiones a facturas calculando IVA automáticamente
- **PDF profesional**: Generación de PDFs con logo de empresa y formato fiscal

### 👥 Clientes
- **CRUD completo**: Gestión de datos de clientes
- **Datos fiscales**: RFC, régimen fiscal, dirección fiscal completa
- **Uso CFDI**: Configuración por cliente

### 📊 Reportes y Análisis
- **Dashboard**: Métricas de ventas, ingresos, gastos y márgenes
- **Reportes PDF/Excel**: Generación de reportes descargables
- **Reportes financieros**: Análisis de rentabilidad

### 💸 Gastos
- **Registro de gastos**: Control de gastos operativos
- **Categorización**: Por tipo de gasto

### 🔐 Seguridad y Usuarios
- **Autenticación JWT**: Login seguro con tokens
- **Roles y permisos**: Sistema de roles (admin, vendedor, etc.)
- **Gestión de usuarios**: CRUD de usuarios con asignación de roles

### 🏪 Configuración de Empresa
- **Datos fiscales**: RFC, razón social, nombre comercial, régimen fiscal
- **Dirección fiscal completa**: Calle, número, colonia, CP, ciudad, estado
- **Logo**: Subida de logo para usar en documentos
- **Persistencia en BD**: Configuración guardada en base de datos

### 🔧 Sistema
- **Respaldos**: Sistema de backups de la base de datos
- **Logs**: Sistema de logging para debugging
- **Migraciones**: Scripts de migración para actualizaciones de BD

## 🏗️ Arquitectura del Proyecto

Este proyecto sigue una arquitectura cliente-servidor:

- **Backend**: API REST desarrollada con FastAPI (Python), utilizando SQLAlchemy para la persistencia de datos, autenticación JWT y generación de reportes.
- **Frontend**: Aplicación web moderna construida con React, TypeScript y Vite, con una interfaz de usuario responsive usando Tailwind CSS y componentes shadcn/ui.
- **Base de Datos**: SQLite para desarrollo (fácilmente configurable para PostgreSQL u otros motores en producción).

## 📁 Estructura del Proyecto

```
Meditrib/
├── backend/                 # API FastAPI
│   ├── core/               # Lógica central
│   │   ├── models.py       # Modelos SQLAlchemy
│   │   ├── schemas.py      # Esquemas Pydantic
│   │   ├── database.py     # Configuración BD
│   │   └── crud/           # Operaciones CRUD
│   ├── routers/            # Endpoints de la API
│   ├── reports/            # Generación PDF/Excel
│   ├── migrations/         # Scripts de migración
│   └── main.py             # Punto de entrada
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── ui/         # Componentes shadcn/ui
│   │   │   ├── sales/      # Componentes de ventas
│   │   │   ├── invoices/   # Componentes de facturas
│   │   │   ├── medicines/  # Componentes de medicamentos
│   │   │   └── ...
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Hooks personalizados
│   │   ├── types/          # Definiciones TypeScript
│   │   └── utils/          # Utilidades (PDF generators, etc.)
│   └── package.json
├── logs/                   # Archivos de log
├── uploads/                # Archivos subidos (imágenes)
├── requirements.txt        # Dependencias Python
├── run.py                  # Script para ejecutar ambos servicios
└── README.md
```

## 🚀 Instalación y Ejecución

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

1. La base de datos se crea automáticamente al iniciar el backend
2. Registra un usuario administrador desde el frontend
3. Configura los datos de tu empresa en **Configuración > Datos de la Empresa**

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido
- **SQLAlchemy**: ORM para base de datos
- **Uvicorn**: Servidor ASGI
- **Pandas/OpenPyXL/ReportLab**: Generación de reportes
- **PassLib/PyJWT**: Autenticación segura

### Frontend
- **React 18**: Biblioteca para interfaces de usuario
- **TypeScript**: Tipado estático
- **Vite**: Herramienta de construcción rápida
- **Tailwind CSS**: Framework CSS utilitario
- **shadcn/ui + Radix UI**: Componentes accesibles
- **TanStack Query**: Gestión de estado del servidor
- **React Router**: Navegación del lado cliente
- **Tabler Icons**: Iconografía

## 🗺️ Roadmap - Próximas Implementaciones

### 🔴 Prioridad Alta

#### Facturación Electrónica CFDI 4.0
- [ ] Integración con PAC (Proveedor Autorizado de Certificación)
- [ ] Firma digital de facturas
- [ ] Generación de XML CFDI
- [ ] Timbrado de facturas
- [ ] Cancelación de CFDI

#### Importación de Medicamentos
- [ ] Actualización de stock por lotes

#### Códigos de Barras
- [ ] Generación de etiquetas con código de barras

### 🟡 Prioridad Media

#### Mejoras de Ventas
- [ ] Punto de venta (POS) con interfaz táctil
- [ ] Descuentos por producto
- [ ] Múltiples métodos de pago por venta

#### Notificaciones y Comunicación
- [ ] Envío de facturas por email
- [ ] Notificaciones push de alertas
- [ ] Recordatorios de reorden

#### Reportes Avanzados
- [ ] Reportes personalizables

### 🟢 Prioridad Baja

#### Integraciones
- [ ] API para sistemas externos
- [ ] Integración con sistemas de salud gubernamentales
- [ ] Conexión con proveedores para pedidos automáticos

#### Mejoras de UX
- [ ] Modo offline con sincronización
- [ ] App móvil (PWA)
- [ ] Atajos de teclado
- [ ] Temas personalizables

#### Seguridad Avanzada
- [ ] Autenticación de dos factores (2FA)
- [ ] Auditoría de acciones
- [ ] Permisos granulares por módulo

## 📚 Documentación Adicional

- **Backend API**: Documentación automática en `/docs` cuando el servidor está ejecutándose
- **Arquitectura**: Ver `SYSTEM_ARCHITECTURE.md`
- **Especificación Técnica**: Ver `TECHNICAL_SPECIFICATION_NEXT_VERSION.md`

## 📄 Licencia

Este proyecto es privado y está destinado para uso interno de la farmacia.</content>
<parameter name="filePath">/Users/eolivan/Projects/EO/Meditrib/README.md