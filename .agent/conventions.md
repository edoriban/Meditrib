# Convenciones de Código y Diseño

## General
*   **Idioma**: Código (nombres de variables, funciones, commits) en **Inglés**. Comentarios explicativos y documentación en **Español** (preferido) o Inglés.
*   **Encoding**: UTF-8.

## Backend (Python/FastAPI)

### Estilo
*   Seguir **PEP 8**. Usar `Black` para formateo automático si es posible.
*   **Type Hinting**: OBLIGATORIO en todas las funciones y argumentos. Usar tipos de `typing` (`List`, `Optional`, etc.) o tipos nativos de Python 3.10+ (`list[]`, `str | None`).

### Estructura de Proyecto
*   **Separación de Responsabilidades**:
    *   **Models (`models.py`)**: Solo definiciones de tablas SQL (SQLAlchemy). No lógica de negocio.
    *   **Schemas (`schemas.py`)**: Solo validación de datos (Pydantic). Requests/Responses.
    *   **CRUD (`crud/`)**: Solo consultas a base de datos. Nada de lógica HTTP aquí.
    *   **Routers (`routers/`)**: Manejo de requests HTTP, códigos de estado, inyección de dependencias. Llaman a las funciones CRUD.

### Naming
*   **Clases (Modelos/Schemas)**: `CamelCase` (ej. `MedicineItem`).
*   **Variables/Funciones**: `snake_case` (ej. `get_medicine_by_id`).
*   **Variables de Entorno**: `UPPER_SNAKE_CASE` (ej. `DATABASE_URL`).

## Frontend (React/TypeScript)

### Estilo
*   Usar `ESLint` y `Prettier`.
*   **Componentes Funcionales**: Siempre usar `function Component() {}` o `const Component = () => {}`. Preferir hooks sobre componentes de clase.

### Estructura
*   **Co-location**: Mantener archivos relacionados cerca.
*   **Componentes UI**: Componentes "tontos" (sin lógica de negocio compleja) en `components/ui`.
*   **Pages**: Componentes "listos" conectados a rutas en `pages/`.

### Estado
*   **Server State**: Usar **React Query** (`useQuery`, `useMutation`). NO guardar datos del servidor en `useState` manual o Redux, dejar que React Query maneje la caché.
*   **Formularios**: Usar **React Hook Form** + **Zod** para validación.

### CSS / Estilos
*   **TailwindCSS**: Usar clases utilitarias directamente.
*   Usar `clsx` o `tailwind-merge` (`cn` utility) para combinar clases condicionales.

## Git Workflow
*   **Mensajes de Commit**: Claros y descriptivos.
    *   `feat: ...` para nuevas características.
    *   `fix: ...` para corrección de bugs.
    *   `docs: ...` para documentación.
    *   `refactor: ...` para cambios de código que no cambian comportamiento.
