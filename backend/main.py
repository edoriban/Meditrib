from fastapi import FastAPI
from backend.database import engine
from backend.models import Base
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
