from sqlalchemy.orm import Session
from backend.core import models
from backend.core import schemas


def get_medicine(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Medicine).offset(skip).limit(limit).all()


def create_medicine(db: Session, medicine: schemas.MedicineCreate):
    db_medicine = models.Medicine(name=medicine.name, description=medicine.description, sale_price=medicine.sale_price)
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    # Si hay información de inventario, crearla también
    if hasattr(medicine, "inventory") and medicine.inventory:
        db_inventory = models.Inventory(medicine_id=db_medicine.id, quantity=medicine.inventory.quantity)
        db.add(db_inventory)
        db.commit()

    return db_medicine


def update_medicine(db: Session, medicine_id: int, medicine: schemas.MedicineUpdate):
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if db_medicine:
        update_data = medicine.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if hasattr(db_medicine, key) and value is not None:
                setattr(db_medicine, key, value)
        db.commit()
        db.refresh(db_medicine)
    return db_medicine


def delete_medicine(db: Session, medicine_id: int):
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if db_medicine:
        db.delete(db_medicine)
        db.commit()
    return db_medicine


def get_medicine_by_name(db: Session, name: str):
    return db.query(models.Medicine).filter(models.Medicine.name == name).first()


def get_medicine_with_inventory(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
