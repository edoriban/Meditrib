from fastapi import FastAPI

# Actualizar importaciones para apuntar a la carpeta 'core'
from backend.core.database import engine
from backend.core.models import Base
from backend.routers import medicines, suppliers

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MediTrib API")

# Include routers
app.include_router(medicines.router)
app.include_router(suppliers.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to MediTrib API"}
