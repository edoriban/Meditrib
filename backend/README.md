# Meditrib Backend API

Esta es la API backend para la aplicación Meditrib, desarrollada con FastAPI. Proporciona endpoints para gestionar medicamentos, proveedores, inventario, usuarios, clientes, ventas y reportes.

## Estructura del Proyecto

-   `core/`: Contiene la lógica central, incluyendo modelos de base de datos (`models.py`), esquemas Pydantic (`schemas.py`), configuración de base de datos (`database.py`) y dependencias (`dependencies.py`).
-   `crud/`: Módulos con funciones para interactuar con la base de datos (Crear, Leer, Actualizar, Eliminar) para cada modelo.
-   `routers/`: Define los endpoints de la API utilizando FastAPI `APIRouter`. Cada archivo corresponde a un recurso principal (ej. `medicines.py`, `users.py`).
-   `reports/`: Lógica para la generación de reportes (ej. `pdf.py`).
-   `main.py`: Punto de entrada de la aplicación FastAPI, configuración de middleware y montaje de routers.

## Ejecución

Para ejecutar la API localmente:

1.  Asegúrate de tener Python y pip instalados.
2.  Instala las dependencias: `pip install -r requirements.txt` (Asegúrate de tener un archivo `requirements.txt`).
3.  Ejecuta el servidor: `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`

La API estará disponible en `http://localhost:8000`. La documentación interactiva (Swagger UI) estará en `http://localhost:8000/docs`.
