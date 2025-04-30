from sqlalchemy.orm import Session
from backend.core import models, schemas


def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()


def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).offset(skip).limit(limit).all()


def create_sale(db: Session, sale: schemas.SaleCreate):
    # Aquí podrías añadir lógica adicional, como verificar el inventario
    # antes de crear la venta.
    db_sale = models.Sale(**sale.model_dump())
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    # Considera actualizar el inventario aquí después de la venta.
    return db_sale


def update_sale(db: Session, sale_id: int, sale_update: schemas.SaleUpdate):
    db_sale = get_sale(db, sale_id)
    if db_sale:
        update_data = sale_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_sale, key, value)
        db.commit()
        db.refresh(db_sale)
    return db_sale


def delete_sale(db: Session, sale_id: int):
    db_sale = get_sale(db, sale_id)
    if db_sale:
        # Considera si eliminar una venta debe revertir cambios en inventario.
        db.delete(db_sale)
        db.commit()
    return db_sale


def get_sales_by_client(db: Session, client_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).filter(models.Sale.client_id == client_id).offset(skip).limit(limit).all()


def get_sales_by_medicine(db: Session, medicine_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).filter(models.Sale.medicine_id == medicine_id).offset(skip).limit(limit).all()
