# Meditrib Frontend

Aplicación web moderna para el sistema de gestión de farmacias Meditrib, construida con React, TypeScript y Vite.

## ✅ Páginas y Funcionalidades Implementadas

### 📊 Dashboard (`pages/DashboardPage.tsx`)
- Métricas de ventas del día/mes
- Resumen de ingresos y gastos
- Alertas activas
- Gráficos de tendencias

### 💊 Inventario (`pages/inventory/`)
- Lista de medicamentos con filtros
- Creación/edición de medicamentos
- Campos fiscales: clave SAT, tasa IVA
- Subida de imágenes
- Gestión de etiquetas

### 📦 Lotes (`pages/batches/`)
- Control de lotes por medicamento
- Fecha de caducidad
- Número de lote
- Stock por lote

### 🏢 Proveedores (`pages/suppliers/`)
- CRUD de proveedores
- Información de contacto

### 📋 Órdenes de Compra (`pages/purchase_orders/`)
- Creación de órdenes
- Seguimiento de estados
- Recepción de mercancía

### 👤 Clientes (`pages/clients/`)
- CRUD de clientes
- Datos fiscales completos
- RFC, régimen fiscal, uso CFDI
- Dirección fiscal

### 💰 Ventas (`pages/sales/`)
- Registro de ventas con múltiples productos
- **Tipos de documento**:
  - Venta: Con IVA por producto
  - Remisión: Sin IVA
- Estados: pendiente, confirmada, cancelada
- Descuentos
- Validación de stock
- Ajuste automático con opción de confirmar

### 🧾 Facturas (`pages/invoices/`)
- Lista de facturas
- Crear factura desde venta
- Conversión de remisión a factura (calcula IVA)
- Validación de empresa configurada
- Generación de PDF profesional

### 💸 Gastos (`pages/expenses/`)
- Registro de gastos
- Categorización

### ⚠️ Alertas (`pages/alerts/`)
- Stock bajo
- Productos próximos a caducar
- Stock crítico

### 📈 Reportes (`pages/reports/`)
- Generación de PDF
- Generación de Excel
- Reportes financieros

### 👥 Usuarios (`pages/users/`)
- Gestión de usuarios
- Asignación de roles

### 🔐 Roles (`pages/roles/`)
- Gestión de roles
- Permisos

### ⚙️ Configuración (`pages/settings/`)
- **Datos de Empresa**:
  - Nombre comercial y razón social
  - RFC y régimen fiscal
  - Dirección fiscal completa
  - Teléfono y email
  - Logo de empresa
- Alertas de inventario (umbrales)
- Configuración de impresión
- Respaldos

### 🔑 Autenticación (`pages/login/`)
- Login
- Registro

### 📚 Otros
- Página de ayuda (`pages/help/`)
- Términos legales (`pages/legal/`)

## 📁 Estructura del Proyecto

```
frontend/src/
├── components/              # Componentes reutilizables
│   ├── ui/                 # Componentes shadcn/ui base
│   ├── sales/              # Componentes de ventas
│   │   ├── SalesTable.tsx
│   │   ├── CreateSaleDialog.tsx
│   │   ├── EditSaleDialog.tsx
│   │   ├── StockConfirmationDialog.tsx
│   │   └── ...
│   ├── invoices/           # Componentes de facturas
│   │   ├── CreateInvoiceDialog.tsx
│   │   └── ...
│   ├── medicines/          # Componentes de medicamentos
│   ├── clients/            # Componentes de clientes
│   ├── suppliers/          # Componentes de proveedores
│   ├── alerts/             # Componentes de alertas
│   ├── batches/            # Componentes de lotes
│   ├── expenses/           # Componentes de gastos
│   ├── backups/            # Componentes de respaldos
│   ├── financial-reports/  # Reportes financieros
│   └── ...
├── pages/                  # Páginas de la aplicación
├── hooks/                  # Hooks personalizados
├── types/                  # Definiciones TypeScript
├── utils/                  # Utilidades
│   └── salePdfGenerator.ts # Generador de PDFs
├── layouts/                # Layouts de página
├── lib/                    # Librerías auxiliares
├── App.tsx                 # Router principal
├── config.ts               # Configuración (API URL)
└── main.tsx               # Punto de entrada
```

## 🛠️ Tecnologías

| Tecnología | Uso |
|------------|-----|
| **React 18** | UI Library |
| **TypeScript** | Tipado estático |
| **Vite** | Build tool |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes UI |
| **Radix UI** | Primitivos accesibles |
| **TanStack Query** | Estado del servidor |
| **React Router** | Navegación |
| **React Hook Form** | Formularios |
| **Zod** | Validación |
| **Axios** | HTTP client |
| **Tabler Icons** | Iconos |
| **Sonner** | Notificaciones |
| **Recharts** | Gráficos |
| **jsPDF** | Generación de PDFs |

## 🚀 Ejecución

```bash
cd frontend
pnpm install
pnpm dev
```

La aplicación estará en `http://localhost:5173`

## 🎨 Convenciones de Diseño

Ver `.github/copilot-instructions.md` para:
- Sistema de cards con gradientes
- Colores semánticos
- Formato de moneda (MXN)
- Patrones de componentes
- Responsive design con container queries

## 🗺️ Roadmap Frontend

### Por Implementar

- [ ] **Escáner de códigos de barras**: Integración con cámara
- [ ] **POS táctil**: Interfaz de punto de venta
- [ ] **Edición de precios en venta**: Precio individual por producto
- [ ] **Dashboard interactivo**: Gráficos con drill-down
- [ ] **PWA**: Modo offline
- [ ] **Atajos de teclado**: Navegación rápida
- [ ] **Notificaciones push**: Alertas en tiempo real
