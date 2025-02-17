from sqlalchemy.orm import Session
from backend import schemas
from backend.models import Medicine, Supplier


# Medicines
def create_medicine(db: Session, medicine: schemas.MedicineCreate):
    db_medicine = Medicine(**medicine.dict())
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)
    return db_medicine


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Medicine).offset(skip).limit(limit).all()


# Suppliers
def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier
