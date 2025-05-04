# Meditrib Backend API

Esta es la API backend para la aplicación Meditrib, desarrollada con FastAPI. Proporciona endpoints para gestionar medicamentos, proveedores, inventario, usuarios, clientes, ventas y reportes.

## Estructura del Proyecto

-   `core/`: Contiene la lógica central, incluyendo modelos de base de datos ([`models.py`](backend/core/models.py)), esquemas Pydantic ([`schemas.py`](backend/core/schemas.py)), configuración de base de datos ([`database.py`](backend/core/database.py)) y dependencias ([`dependencies.py`](backend/core/dependencies.py)).
-   `crud/`: Módulos con funciones para interactuar con la base de datos (Crear, Leer, Actualizar, Eliminar) para cada modelo (ej. [`crud_medicines.py`](backend/core/crud/crud_medicines.py), [`crud_client.py`](backend/core/crud/crud_client.py)).
-   `routers/`: Define los endpoints de la API utilizando FastAPI `APIRouter`. Cada archivo corresponde a un recurso principal (ej. [`medicines.py`](backend/routers/medicines.py), [`users.py`](backend/routers/users.py)). Consulta [`routers/README.md`](backend/routers/README.md) para más detalles.
-   `reports/`: Lógica para la generación de reportes (ej. [`pdf.py`](backend/reports/pdf.py), [`excel.py`](backend/reports/excel.py)).
-   `main.py`: Punto de entrada de la aplicación FastAPI, configuración de middleware y montaje de routers.
-   `init_db.py`: Script para inicializar la base de datos, creando las tablas (si no existen) y datos iniciales como roles predeterminados.

## Ejecución

Para ejecutar la API localmente:

1.  Asegúrate de tener Python y pip instalados.
2.  Instala las dependencias: `pip install -r requirements.txt` (Asegúrate de tener un archivo `requirements.txt` actualizado).
3.  **Inicializa la base de datos (la primera vez):** Ejecuta `python -m backend.init_db` desde el directorio raíz del proyecto (`Meditrib/`). Esto creará el archivo `meditrib.db` y los roles iniciales si no existen.
4.  Ejecuta el servidor: `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`

La API estará disponible en `http://localhost:8000`. La documentación interactiva (Swagger UI) estará en `http://localhost:8000/docs`.