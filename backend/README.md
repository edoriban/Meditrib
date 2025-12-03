# Meditrib Backend API

API REST para el sistema Meditrib, desarrollada con FastAPI. Proporciona endpoints completos para gestionar medicamentos, proveedores, inventario, usuarios, clientes, ventas, facturas y reportes.

## ✅ Módulos Implementados

### 🔐 Autenticación (`routers/auth.py`)
- Login con JWT tokens
- Registro de usuarios
- Refresh de tokens

### 👥 Usuarios y Roles (`routers/users.py`, `routers/roles.py`)
- CRUD de usuarios
- Gestión de roles y permisos
- Asignación de roles a usuarios

### 💊 Medicamentos (`routers/medicines.py`)
- CRUD completo de medicamentos
- Campos fiscales: clave SAT, tasa IVA
- Subida de imágenes
- Etiquetas/categorías (`routers/medicine_tags.py`)

### 📦 Lotes (`routers/batches.py`)
- Control de lotes por medicamento
- Fecha de caducidad y número de lote
- Stock por lote

### 🏢 Proveedores (`routers/suppliers.py`)
- CRUD de proveedores
- Información de contacto

### 📋 Órdenes de Compra (`routers/purchase_order.py`)
- Creación de órdenes
- Estados: pendiente, en proceso, recibido, cancelado
- Detalle de productos

### 👤 Clientes (`routers/clients.py`)
- CRUD de clientes
- Datos fiscales: RFC, régimen fiscal, uso CFDI
- Dirección fiscal completa

### 💰 Ventas (`routers/sales.py`)
- Registro de ventas con múltiples productos
- Tipos de documento: venta, remisión
- Estados: pendiente, confirmada, cancelada
- Descuentos y cálculo de totales
- Ajuste automático de stock

### 🧾 Facturas (`routers/invoices.py`)
- Generación de facturas desde ventas
- Cálculo de IVA por producto
- Configuración de empresa (datos fiscales, logo)
- Generación de XML para CFDI (estructura base)
- CRUD de empresas emisoras

### 💸 Gastos (`routers/expenses.py`)
- Registro de gastos operativos
- Categorización

### ⚠️ Alertas (`routers/alerts.py`)
- Alertas de stock bajo
- Alertas de productos próximos a caducar
- Alertas de stock crítico

### 📊 Reportes (`routers/reports.py`)
- Generación de PDF
- Generación de Excel
- Reportes financieros

### 💾 Respaldos (`routers/backups.py`)
- Creación de backups de BD
- Restauración de backups

## 📁 Estructura del Proyecto

```
backend/
├── core/                    # Lógica central
│   ├── models.py           # Modelos SQLAlchemy
│   ├── schemas.py          # Esquemas Pydantic
│   ├── database.py         # Configuración de BD
│   ├── dependencies.py     # Dependencias FastAPI
│   ├── security.py         # Autenticación JWT
│   ├── middleware.py       # Middleware personalizado
│   ├── logging_config.py   # Configuración de logs
│   ├── backup.py           # Lógica de respaldos
│   └── crud/               # Operaciones CRUD
│       ├── crud_medicines.py
│       ├── crud_client.py
│       ├── crud_sale.py
│       ├── crud_invoice.py
│       ├── crud_batches.py
│       ├── crud_alert.py
│       ├── crud_expense.py
│       ├── crud_suppliers.py
│       ├── crud_purchase_order.py
│       ├── crud_user.py
│       ├── crud_role.py
│       └── ...
├── routers/                # Endpoints de la API
├── reports/                # Generación de reportes
│   ├── pdf.py
│   └── excel.py
├── migrations/             # Scripts de migración
│   ├── add_new_fields_migration.py
│   ├── add_company_fields.py
│   └── ...
├── utils/                  # Utilidades
│   └── pricing_formula.py
├── main.py                 # Punto de entrada
├── init_db.py             # Inicialización de BD
└── seed_data.py           # Datos de prueba
```

## 🚀 Ejecución

### Desarrollo

```bash
# Desde el directorio raíz de Meditrib
pip install -r requirements.txt
python -m backend.init_db  # Primera vez
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Con script principal

```bash
python run.py  # Ejecuta backend y frontend juntos
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🗄️ Base de Datos

### Modelos Principales

| Modelo | Descripción |
|--------|-------------|
| `User` | Usuarios del sistema |
| `Role` | Roles de usuario |
| `Medicine` | Medicamentos con info fiscal |
| `MedicineTag` | Etiquetas/categorías |
| `Batch` | Lotes de medicamentos |
| `Supplier` | Proveedores |
| `PurchaseOrder` | Órdenes de compra |
| `Client` | Clientes con datos fiscales |
| `Sale` | Ventas/Remisiones |
| `SaleItem` | Items de venta |
| `Invoice` | Facturas |
| `InvoiceConcept` | Conceptos de factura |
| `Company` | Empresa emisora (datos fiscales) |
| `Expense` | Gastos |
| `Alert` | Alertas del sistema |

### Migraciones

```bash
# Ejecutar migración específica
python backend/migrations/add_company_fields.py
```

## 🔐 Autenticación

La API usa JWT (JSON Web Tokens):

```http
Authorization: Bearer <token>
```

## 🗺️ Roadmap Backend

### Por Implementar

- [ ] **CFDI 4.0**: Integración con PAC para timbrado
- [ ] **Firma Digital**: Sellado de facturas con certificado
- [ ] **Email**: Envío de facturas por correo
- [ ] **Importación Excel**: Endpoint para importar medicamentos
- [ ] **Webhooks**: Notificaciones en tiempo real
- [ ] **2FA**: Autenticación de dos factores
- [ ] **Auditoría**: Log de acciones de usuarios