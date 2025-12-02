from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from backend.core import models
from backend.core import schemas
from backend.core.crud.crud_alert import check_and_create_alerts


def get_medicine(db: Session, medicine_id: int):
    return db.query(models.Medicine).filter(models.Medicine.id == medicine_id).first()


def get_medicines(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Medicine).offset(skip).limit(limit).all()


def get_medicines_paginated(
    db: Session, 
    page: int = 1, 
    page_size: int = 50,
    search: str = None,
    stock_filter: str = "all"  # "all", "in-stock", "out-of-stock"
):
    """Obtener medicamentos con paginación y filtros del lado del servidor"""
    query = db.query(models.Medicine)
    
    # Filtro de búsqueda
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Medicine.name.ilike(search_term),
                models.Medicine.barcode.ilike(search_term),
                models.Medicine.laboratory.ilike(search_term),
                models.Medicine.active_substance.ilike(search_term)
            )
        )
    
    # Filtro de stock
    if stock_filter == "in-stock":
        query = query.join(models.Inventory).filter(models.Inventory.quantity > 0)
    elif stock_filter == "out-of-stock":
        query = query.outerjoin(models.Inventory).filter(
            or_(models.Inventory.quantity == 0, models.Inventory.quantity == None)
        )
    
    # Contar total
    total = query.count()
    
    # Aplicar paginación
    offset = (page - 1) * page_size
    medicines = query.offset(offset).limit(page_size).all()
    
    return {
        "items": medicines,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size
    }


def get_medicines_count(db: Session):
    """Obtener el conteo total de medicamentos"""
    return db.query(func.count(models.Medicine.id)).scalar()


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

def get_medicine_by_barcode(db: Session, barcode: str):
    """Buscar medicamento por código de barras"""
    return db.query(models.Medicine).filter(models.Medicine.barcode == barcode).first()

def search_medicines_by_barcode(db: Session, barcode: str):
    """Buscar medicamentos que contengan el código de barras (búsqueda parcial)"""
    return db.query(models.Medicine).filter(models.Medicine.barcode.contains(barcode)).all()

def search_medicines(db: Session, query: str):
    """Buscar medicamentos por nombre, código de barras o sustancia activa"""
    return db.query(models.Medicine).filter(
        models.Medicine.name.contains(query) |
        models.Medicine.barcode.contains(query) |
        models.Medicine.active_substance.contains(query)
    ).all()
