from sqlalchemy.orm import Session
from backend.core import models  # Importa los modelos desde la nueva ubicación

# Importa los esquemas desde la nueva ubicación
from backend.core import schemas


# Ejemplo de función CRUD usando schemas
def get_supplier(db: Session, supplier_id: int):
    return db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()


def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Supplier).offset(skip).limit(limit).all()


def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = models.Supplier(**supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


# ... otras funciones CRUD ...
