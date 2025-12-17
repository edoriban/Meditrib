from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.database import engine, Base
from backend.routers import medicines, suppliers, users, roles, sales,clients,reports as basic_reports,auth, medicine_tags, purchase_order, alerts, invoices, expenses
from backend.routers import reports as financial_reports
from backend.routers import batches
from backend.core.middleware import RequestLoggingMiddleware, SystemHealthMiddleware, AuditMiddleware
from backend.core.logging_config import setup_logging
from backend.init_db import init_db
import logging

# Configurar logging avanzado
setup_logging(log_level="INFO", log_dir="logs")
logger = logging.getLogger(__name__)

# Crear tablas en la base de datos
Base.metadata.create_all(bind=engine)

init_db()

# Crear la aplicación FastAPI
app = FastAPI(title="Meditrib API", description="API para gestión de medicamentos y proveedores", version="1.0.0")

# Agregar middlewares
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SystemHealthMiddleware, check_interval=60)  # Chequear cada 60 segundos
app.add_middleware(AuditMiddleware)

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
app.include_router(basic_reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(financial_reports.router, prefix="/api/v1/financial-reports", tags=["financial-reports"])
app.include_router(batches.router, prefix="/api/v1/batches", tags=["batches"])
app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
app.include_router(medicine_tags.router, prefix="/api/v1", tags=["medicine-tags"])
app.include_router(purchase_order.router, prefix="/api/v1", tags=["purchase-orders"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(invoices.router, prefix="/api/v1/invoices", tags=["invoices"])
app.include_router(expenses.router, prefix="/api/v1/expenses", tags=["expenses"])


@app.get("/")
def read_root():
    logger.info("Root endpoint accessed")
    return {"message": "Bienvenido a la API de Meditrib"}




if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=9999, reload=True)
