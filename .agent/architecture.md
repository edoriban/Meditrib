# Arquitectura del Sistema Meditrib

## Visión General
Meditrib es un sistema de gestión de inventario y punto de venta (POS) diseñado para farmacias y distribuidores médicos. Sigue una arquitectura cliente-servidor monolítica modular, desplegada en contenedores Docker para consistencia entre entornos.

## Stack Tecnológico

### Backend (API)
*   **Lenguaje**: Python 3.10+
*   **Framework**: FastAPI (Alto rendimiento, tipado estático, Pydantic)
*   **ORM**: SQLAlchemy v1.4 (Manejo de base de datos)
*   **Servidor de Aplicación**: Gunicorn con workers Uvicorn
*   **Gestión de Dependencias**: pip / requirements.txt

### Frontend (UI)
*   **Lenguaje**: TypeScript
*   **Framework**: React 18
*   **Build Tool**: Vite
*   **Estilos**: TailwindCSS v4
*   **Componentes UI**: Radix UI / Shadcn UI
*   **Estado**: TanStack Query (React Query) para estado servidor, Context API para estado local.

### Datos e Infraestructura
*   **Base de Datos**: PostgreSQL 15 (Producción) / SQLite (Desarrollo local simple)
*   **Hosting**: Docker Compose (Multi-container orchestration)
*   **Proxy Reverso**: Nginx (Manejo de tráfico HTTP y estáticos)

## Diagrama de Contenedores

```mermaid
graph TD
    Client[Cliente (Navegador)] -->|HTTP/HTTPS| Nginx[Servidor Web Nginx]
    
    subgraph "Docker Compose"
        Nginx -->|/api/*| Backend[Backend (FastAPI)]
        Nginx -->|/*| Static[Archivos Estáticos (React Build)]
        Backend -->|SQL| DB[(PostgreSQL DB)]
        
        Backend -- Lee/Escribe --> DB
    end
```

## Estructura de Directorios

### Root
*   `docker-compose.yml`: Orquestador de servicios.
*   `nginx.conf`: Configuración del proxy.
*   `backend/`: Código fuente del servidor.
*   `frontend/`: Código fuente de la interfaz.

### Backend (`/backend`)
*   `core/`: Configuración central, modelos de BD, esquemas Pydantic y seguridad.
*   `routers/`: Endpoints de la API divididos por dominio (medicinas, usuarios, ventas).
*   `crud/`: Lógica de acceso a datos (Queries).
*   `utils/`: Utilidades genéricas (fórmulas de precios, etc.).

### Frontend (`/frontend`)
*   `src/components/`: Componentes reutilizables (UI kit).
*   `src/hooks/`: Custom hooks.
*   `src/pages/`: Vistas principales (Ruteo).
*   `src/lib/`: Utilidades (cliente axios, utils).

## Flujo de Datos Típico (Crear Venta)
1.  **Frontend**: Usuario llena formulario de venta -> `useMutation` (React Query).
2.  **API Request**: POST `/api/v1/sales/` -> Nginx -> FastAPI Backend.
3.  **Backend Controller**: `routers/sales.py` recibe datos y valida con Pydantic (`schemas.SaleCreate`).
4.  **Backend Business Logic**: `crud/crud_sales.py` verifica stock y calcula totales.
5.  **Database**: SQLAlchemy inicia transacción, actualiza inventario y guarda venta -> PostgreSQL.
6.  **Response**: Backend retorna objeto Venta creado -> Frontend actualiza caché y UI.
