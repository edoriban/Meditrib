# Core del Backend Meditrib

Esta carpeta contiene los componentes fundamentales del backend.

## Componentes

-   **`database.py`**: Configuración de la conexión a la base de datos SQLAlchemy (motor, sesión local, clase base declarativa).
-   **`models.py`**: Definiciones de los modelos de datos utilizando SQLAlchemy ORM. Estos modelos representan las tablas de la base de datos.
-   **`schemas.py`**: Definiciones de los esquemas Pydantic utilizados para la validación de datos de entrada/salida en la API y la serialización.
-   **`dependencies.py`**: Dependencias reutilizables de FastAPI, como la función `get_db` para obtener una sesión de base de datos por solicitud.

## Modelos de Base de Datos (`models.py`)

Los modelos definidos actualmente son:

-   `Medicine`: Representa un medicamento con sus detalles y precios. Relacionado con `Inventory` y `SupplierMedicine`.
-   `Supplier`: Representa un proveedor de medicamentos. Relacionado con `SupplierMedicine`.
-   `SupplierMedicine`: Tabla de asociación entre `Supplier` y `Medicine`, indicando qué proveedor suministra qué medicamento y a qué precio.
-   `Inventory`: Representa la cantidad en stock de un medicamento específico. Relacionado con `Medicine`.
-   `User`: Representa un usuario del sistema. Relacionado con `Role` y `Report`.
-   `Role`: Representa un rol de usuario (ej. Administrador, Vendedor). Relacionado con `User`.
-   `Sale`: Representa una transacción de venta. Relacionado con `Medicine` y `Client`.
-   `Client`: Representa un cliente que realiza compras. Relacionado con `Sale`.
-   `Report`: Representa un reporte generado por el sistema. Relacionado con `User`.

Las relaciones entre tablas se definen utilizando `relationship` de SQLAlchemy.
