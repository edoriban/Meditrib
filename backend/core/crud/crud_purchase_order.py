from sqlalchemy.orm import Session
from backend.core import models, schemas
from typing import List


def get_purchase_order(db: Session, order_id: int):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.id == order_id).first()


def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).offset(skip).limit(limit).all()


def create_purchase_order(db: Session, purchase_order: schemas.PurchaseOrderCreate):
    # Crear el objeto PurchaseOrder sin items
    db_purchase_order = models.PurchaseOrder(
        supplier_id=purchase_order.supplier_id,
        order_date=purchase_order.order_date,
        expected_delivery_date=purchase_order.expected_delivery_date,
        status=purchase_order.status,
        total_amount=purchase_order.total_amount or 0
    )
    db.add(db_purchase_order)
    db.commit()
    db.refresh(db_purchase_order)
    
    # Añadir los items
    if purchase_order.items:
        for item in purchase_order.items:
            db_item = models.PurchaseOrderItem(
                purchase_order_id=db_purchase_order.id,
                medicine_id=item.medicine_id,
                quantity=item.quantity,
                unit_price=item.unit_price
            )
            db.add(db_item)
        
        # Actualizar el monto total si no se proporcionó
        if not purchase_order.total_amount:
            db_purchase_order.total_amount = sum(item.quantity * item.unit_price for item in purchase_order.items)
        
        db.commit()
        db.refresh(db_purchase_order)
    
    return db_purchase_order


def update_purchase_order(db: Session, order_id: int, purchase_order: schemas.PurchaseOrderUpdate):
    db_order = get_purchase_order(db, order_id)
    if db_order:
        update_data = purchase_order.model_dump(exclude_unset=True)
        
        # Extraer items para tratarlos por separado
        items_data = update_data.pop('items', None)
        
        # Actualizar campos simples
        for key, value in update_data.items():
            if hasattr(db_order, key):
                setattr(db_order, key, value)
        
        # Actualizar items si se proporcionaron
        if items_data is not None:
            # Eliminar items existentes
            db.query(models.PurchaseOrderItem).filter(models.PurchaseOrderItem.purchase_order_id == order_id).delete()
            
            # Añadir nuevos items
            for item in items_data:
                db_item = models.PurchaseOrderItem(
                    purchase_order_id=order_id,
                    medicine_id=item.medicine_id,
                    quantity=item.quantity,
                    unit_price=item.unit_price
                )
                db.add(db_item)
            
            # Recalcular total si no se proporciona
            if 'total_amount' not in update_data or update_data['total_amount'] is None:
                db_order.total_amount = sum(item.quantity * item.unit_price for item in items_data)
        
        db.commit()
        db.refresh(db_order)
    
    return db_order


def delete_purchase_order(db: Session, order_id: int):
    db_order = get_purchase_order(db, order_id)
    if db_order:
        # SQLAlchemy eliminará automáticamente los items debido a la relación
        db.delete(db_order)
        db.commit()
    return db_order


def get_purchase_orders_by_supplier(db: Session, supplier_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.supplier_id == supplier_id).offset(skip).limit(limit).all()


def get_purchase_orders_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):
    return db.query(models.PurchaseOrder).filter(models.PurchaseOrder.status == status).offset(skip).limit(limit).all()