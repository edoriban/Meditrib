from sqlalchemy.orm import Session
from backend.core import models  # Importa los modelos desde la nueva ubicación

# Importa los esquemas desde la nueva ubicación
from backend.core import schemas


# Ejemplo de función CRUD usando schemas
def get_medicine(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Medicine).offset(skip).limit(limit).all()


def create_medicine(db: Session, medicine: schemas.MedicineCreate):
    db_medicine = models.Medicine(**medicine.model_dump())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


# ... otras funciones CRUD ...
