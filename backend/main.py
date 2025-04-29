from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import engine, Base
from backend.routers import medicines, suppliers

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Crear la aplicación FastAPI
app = FastAPI(title="Meditrib API", description="API para gestión de medicamentos y proveedores", version="1.0.0")

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas las origenes en desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(medicines.router, prefix="/api/v1", tags=["medicines"])
app.include_router(suppliers.router, prefix="/api/v1", tags=["suppliers"])


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de Meditrib"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
