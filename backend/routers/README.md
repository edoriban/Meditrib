# Routers de la API Meditrib

Esta carpeta contiene los módulos que definen los endpoints de la API para cada recurso principal de la aplicación. Cada archivo utiliza `APIRouter` de FastAPI.

## Endpoints Principales

Todos los endpoints están prefijados con `/api/v1`.

-   **`/medicines`**: Operaciones CRUD para medicamentos.
    -   `GET /`: Listar medicamentos.
    -   `POST /`: Crear un nuevo medicamento.
    -   `GET /{medicine_id}`: Obtener detalles de un medicamento.
    -   `PUT /{medicine_id}`: Actualizar un medicamento.
    -   `DELETE /{medicine_id}`: Eliminar un medicamento.
-   **`/suppliers`**: Operaciones CRUD para proveedores.
    -   `GET /`: Listar proveedores.
    -   `POST /`: Crear un nuevo proveedor.
    -   `GET /{supplier_id}`: Obtener detalles de un proveedor.
    -   `PUT /{supplier_id}`: Actualizar un proveedor.
    -   `DELETE /{supplier_id}`: Eliminar un proveedor.
-   **`/roles`**: Operaciones CRUD para roles de usuario.
    -   `GET /`: Listar roles.
    -   `POST /`: Crear un nuevo rol.
    -   `GET /{role_id}`: Obtener detalles de un rol.
    -   `PUT /{role_id}`: Actualizar un rol.
    -   `DELETE /{role_id}`: Eliminar un rol.
-   **`/users`**: Operaciones CRUD para usuarios.
    -   `GET /`: Listar usuarios.
    -   `POST /`: Crear un nuevo usuario.
    -   `GET /{user_id}`: Obtener detalles de un usuario.
    -   `PUT /{user_id}`: Actualizar un usuario.
    -   `DELETE /{user_id}`: Eliminar un usuario.
-   **`/clients`**: Operaciones CRUD para clientes.
    -   `GET /`: Listar clientes.
    -   `POST /`: Crear un nuevo cliente.
    -   `GET /{client_id}`: Obtener detalles de un cliente.
    -   `PUT /{client_id}`: Actualizar un cliente.
    -   `DELETE /{client_id}`: Eliminar un cliente.
-   **`/sales`**: Operaciones CRUD para ventas.
    -   `GET /`: Listar ventas.
    -   `POST /`: Registrar una nueva venta.
    -   `GET /{sale_id}`: Obtener detalles de una venta.
    -   `PUT /{sale_id}`: Actualizar una venta.
    -   `DELETE /{sale_id}`: Eliminar una venta.
-   **`/reports`**: Operaciones CRUD para reportes generados.
    -   `GET /`: Listar reportes.
    -   `POST /`: Crear/generar un nuevo reporte.
    -   `GET /{report_id}`: Obtener detalles de un reporte.
    -   `PUT /{report_id}`: Actualizar un reporte.
    -   `DELETE /{report_id}`: Eliminar un reporte.
-   **`/auth`**: Endpoints de autenticación (ej. login, refresh token).
    -   *(Consultar `auth.py` o `/docs` para detalles específicos)*

Para detalles específicos sobre los parámetros de solicitud y los formatos de respuesta, consulta la documentación interactiva de Swagger UI en `/docs` o `/redoc`.