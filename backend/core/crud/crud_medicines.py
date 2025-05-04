from sqlalchemy.orm import Session
from backend.core import models
from backend.core import schemas


def get_medicine(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Medicine).offset(skip).limit(limit).all()


def create_medicine(db: Session, medicine: schemas.MedicineCreate):
    medicine_data = medicine.model_dump(exclude={"inventory"})
    db_medicine = models.Medicine(**medicine_data)
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    if hasattr(medicine, "inventory") and medicine.inventory:
        db_inventory = models.Inventory(medicine_id=db_medicine.id, quantity=medicine.inventory.quantity)
        db.add(db_inventory)
        db.commit()

    return db_medicine


def update_medicine(db: Session, medicine_id: int, medicine: schemas.MedicineUpdate):
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if db_medicine:
        update_data = medicine.model_dump(exclude_unset=True)
        
        tags_data = update_data.pop('tags', None)
        inventory_data = update_data.pop('inventory', None)
        
        for key, value in update_data.items():
            if hasattr(db_medicine, key) and value is not None:
                setattr(db_medicine, key, value)
        
        if tags_data is not None:
            db_medicine.tags = []
            
            for tag_id in tags_data:
                tag = db.query(models.MedicineTag).filter(models.MedicineTag.id == int(tag_id)).first()
                if tag:
                    db_medicine.tags.append(tag)
        
        if inventory_data:
            db_inventory = db.query(models.Inventory).filter(models.Inventory.medicine_id == medicine_id).first()
            if db_inventory:
                for key, value in inventory_data.items():
                    if hasattr(db_inventory, key) and value is not None:
                        setattr(db_inventory, key, value)
            else:
                db_inventory = models.Inventory(medicine_id=medicine_id, **inventory_data)
                db.add(db_inventory)
        
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
