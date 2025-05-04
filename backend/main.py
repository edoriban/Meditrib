from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import engine, Base
from backend.routers import medicines, suppliers, users, roles, sales,clients,reports,auth, medicine_tags, purchase_order
from backend.init_db import init_db

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

init_db()
# Crear la aplicación FastAPI
app = FastAPI(title="Meditrib API", description="API para gestión de medicamentos y proveedores", version="1.0.0")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(medicines.router, prefix="/api/v1", tags=["medicines"])
app.include_router(suppliers.router, prefix="/api/v1", tags=["suppliers"])
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(roles.router, prefix="/api/v1", tags=["roles"])
app.include_router(sales.router, prefix="/api/v1", tags=["sales"])
app.include_router(clients.router, prefix="/api/v1", tags=["clients"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
app.include_router(medicine_tags.router, prefix="/api/v1", tags=["medicine-tags"])
app.include_router(purchase_order.router, prefix="/api/v1", tags=["purchase-orders"])


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Meditrib"}




if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
