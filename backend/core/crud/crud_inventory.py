from sqlalchemy.orm import Session
from backend.core import models, schemas


def get_inventory(db: Session, medicine_id: int):
    return db.query(models.Inventory).filter(models.Inventory.medicine_id == medicine_id).first()


def get_all_inventory(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Inventory).offset(skip).limit(limit).all()


def create_inventory(db: Session, inventory: schemas.InventoryCreate, medicine_id: int):
    db_inventory = models.Inventory(**inventory.model_dump(), medicine_id=medicine_id)
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    return db_inventory


def update_inventory(db: Session, medicine_id: int, inventory: schemas.InventoryCreate):
    db_inventory = get_inventory(db, medicine_id)
    if db_inventory:
        update_data = inventory.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_inventory, key, value)
        db.commit()
        db.refresh(db_inventory)
    else:
        db_inventory = create_inventory(db, inventory, medicine_id)
    return db_inventory


def delete_inventory(db: Session, medicine_id: int):
    db_inventory = get_inventory(db, medicine_id)
    if db_inventory:
        db.delete(db_inventory)
        db.commit()
    return db_inventory


def get_low_stock_inventory(db: Session, threshold: int = 10, skip: int = 0, limit: int = 100):
    """Obtener inventario con cantidad menor al umbral especificado"""
    return db.query(models.Inventory).filter(models.Inventory.quantity < threshold).offset(skip).limit(limit).all()


def adjust_inventory(db: Session, medicine_id: int, adjustment: int):
    """Ajustar la cantidad en inventario (positivo para añadir, negativo para reducir)"""
    db_inventory = get_inventory(db, medicine_id)
    if db_inventory:
        db_inventory.quantity += adjustment
        db.commit()
        db.refresh(db_inventory)
    return db_inventory