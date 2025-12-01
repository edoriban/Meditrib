from sqlalchemy.orm import Session
from backend.core import models
from backend.core import schemas
from backend.core.crud.crud_alert import check_and_create_alerts


def get_medicine(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Medicine).offset(skip).limit(limit).all()


def create_medicine(db: Session, medicine: schemas.MedicineCreate):
    # Excluir tags e inventory del modelo principal
    medicine_data = medicine.model_dump(exclude={"tags", "inventory"})
    db_medicine = models.Medicine(**medicine_data)
    db.add(db_medicine)
    db.commit()
    db.refresh(db_medicine)

    # Manejar las etiquetas (tags)
    if medicine.tags:
        for tag_id in medicine.tags:
            # Convertimos tag_id a entero si es un string
            tag_id_int = int(tag_id) if isinstance(tag_id, str) else tag_id
            tag = db.query(models.MedicineTag).filter(models.MedicineTag.id == tag_id_int).first()
            if tag:
                db_medicine.tags.append(tag)
        db.commit()
    
    # Crear el registro de inventario si existe
    if medicine.inventory:
        db_inventory = models.Inventory(medicine_id=db_medicine.id, quantity=medicine.inventory.quantity)
        db.add(db_inventory)
        db.commit()

    # Check for alerts after creating medicine
    check_and_create_alerts(db)

    db.refresh(db_medicine)
    return db_medicine


def update_medicine(db: Session, medicine_id: int, medicine: schemas.MedicineUpdate):
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if db_medicine:
        update_data = medicine.model_dump(exclude={"tags", "inventory"})
        
        # Actualizamos los campos básicos del medicamento
        for key, value in update_data.items():
            if hasattr(db_medicine, key):
                setattr(db_medicine, key, value)
        
        # Manejamos las etiquetas
        if medicine.tags is not None:
            db_medicine.tags = []
            
            for tag_id in medicine.tags:
                # Convertimos tag_id a entero
                tag_id_int = int(tag_id) if isinstance(tag_id, str) else tag_id
                tag = db.query(models.MedicineTag).filter(models.MedicineTag.id == tag_id_int).first()
                if tag:
                    db_medicine.tags.append(tag)
        
        # Manejamos el inventario
        if medicine.inventory:
            db_inventory = db.query(models.Inventory).filter(models.Inventory.medicine_id == medicine_id).first()
            if db_inventory:
                db_inventory.quantity = medicine.inventory.quantity
            else:
                db_inventory = models.Inventory(medicine_id=medicine_id, quantity=medicine.inventory.quantity)
                db.add(db_inventory)
        
        db.commit()

        # Check for alerts after updating medicine
        check_and_create_alerts(db)

        db.refresh(db_medicine)

    return db_medicine


def delete_medicine(db: Session, medicine_id: int):
    db_inventory = db.query(models.Inventory).filter(models.Inventory.medicine_id == medicine_id).first()
    if db_inventory:
        db.delete(db_inventory)
    
    db_medicine = db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
    if db_medicine:
        db_medicine.tags = [] 
        
        for supplier_medicine in db_medicine.suppliers:
            db.delete(supplier_medicine)
        
        db.delete(db_medicine)
        db.commit()
        return db_medicine
    return None


def get_medicine_by_name(db: Session, name: str):
    return db.query(models.Medicine).filter(models.Medicine.name == name).first()


def get_medicine_with_inventory(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()
