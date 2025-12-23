---
trigger: always_on
---

# Agent Rules & Context

## 1. Identidad del Proyecto
*   **Nombre**: Meditrib
*   **Propósito**: Punto de Venta (POS) y Gestión de Inventario Farmacéutico.
*   **Estado Actual**: **Production Ready**. Migrado de prototipo local a arquitectura contenerizada.

## 2. Restricciones Críticas (DO NOT BREAK)
1.  **Imágenes**: La funcionalidad de imágenes fue **ELIMINADA INTENCIONALMENTE**. No reintroducir código de carga, almacenamiento local de imágenes o campos `image_path` en modelos.
2.  **Base de Datos**:
    *   **Producción**: PostgreSQL (vía Docker).
    *   **Desarrollo**: SQLite es aceptable solo para pruebas rápidas locales, pero el target es Postgres.
    *   **Conexión**: SIEMPRE usar `backend.core.config.settings` para obtener la URL. Nunca hardcodear strings de conexión.
3.  **Infraestructura**:
    *   `docker-compose.yml` es la fuente de verdad para la ejecución de servicios.
    *   Cualquier nueva dependencia debe agregarse a `requirements.txt` (Backend) o `package.json` (Frontend) Y reconstruir las imágenes Docker.

## 3. Arquitectura "At a Glance"
*   **Frontend**: React + Vite + TailwindCSS + React Query. [Docs](.agent/conventions.md#frontend-reacttypescript)
*   **Backend**: FastAPI + SQLAlchemy + Pydantic. [Docs](.agent/conventions.md#backend-pythonfastapi)
*   **Deploy**: Docker (Nginx -> Backend/Frontend). [Docs](.agent/architecture.md)

## 4. Comandos Rápidos
*   **Full Stack (Prod Sim)**: `docker compose up --build`
*   **Backend Dev**: `python run.py` (corre todo) o `uvicorn backend.main:app --reload`
*   **Frontend Dev**: `cd frontend && pnpm dev`
*   **Tests**: `pytest`

## 5. Ubicación de Documentación Detallada
*   🔍 **Arquitectura**: [.agent/architecture.md](.agent/architecture.md)
*   📝 **Convenciones**: [.agent/conventions.md](.agent/conventions.md)
*   🚀 **Despliegue**: [.agent/workflows/deploy.md](.agent/workflows/deploy.md)