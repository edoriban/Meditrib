from sqlalchemy.orm import Session, joinedload
from backend.core import models, schemas
from typing import List, Optional
from datetime import datetime


def calculate_sale_totals(items_subtotal: float, items_iva: float, document_type: str) -> dict:
    """Calcula los totales de una venta basado en el tipo de documento y el IVA por producto"""
    if document_type == "remission":
        # Nota de remisión: sin IVA (aunque los productos lo tengan)
        iva_amount = 0.0
        total = items_subtotal
    else:
        # Factura: suma el IVA de cada producto que lo tenga
        iva_amount = items_iva
        total = items_subtotal + iva_amount

    return {
        "subtotal": items_subtotal,
        "iva_amount": iva_amount,
        "total": total
    }


def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).options(
        joinedload(models.Sale.items).joinedload(models.SaleItem.medicine),
        joinedload(models.Sale.client),
        joinedload(models.Sale.user)
    ).filter(models.Sale.id == sale_id).first()


def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).options(
        joinedload(models.Sale.items).joinedload(models.SaleItem.medicine),
        joinedload(models.Sale.client),
        joinedload(models.Sale.user)
    ).order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()


def create_sale(db: Session, sale: schemas.SaleCreate):
    # Crear la venta principal
    sale_data = sale.model_dump(exclude={'items'})
    if sale_data.get('sale_date') is None:
        sale_data['sale_date'] = datetime.now()
    
    db_sale = models.Sale(**sale_data)
    db.add(db_sale)
    db.flush()  # Para obtener el ID de la venta
    
    # Crear los items de la venta y calcular subtotales
    items_subtotal = 0.0
    items_iva = 0.0
    for item_data in sale.items:
        # Obtener el medicamento para saber su tasa de IVA
        medicine = db.query(models.Medicine).filter(models.Medicine.id == item_data.medicine_id).first()
        product_iva_rate = medicine.iva_rate if medicine else 0.0
        
        item_subtotal = (item_data.quantity * item_data.unit_price) - item_data.discount
        item_iva = item_subtotal * product_iva_rate
        items_subtotal += item_subtotal
        items_iva += item_iva
        
        db_item = models.SaleItem(
            sale_id=db_sale.id,
            medicine_id=item_data.medicine_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            discount=item_data.discount,
            iva_rate=product_iva_rate,
            subtotal=item_subtotal,
            iva_amount=item_iva
        )
        db.add(db_item)
        
        # Actualizar inventario (reducir stock)
        inventory = db.query(models.Inventory).filter(
            models.Inventory.medicine_id == item_data.medicine_id
        ).first()
        if inventory:
            inventory.quantity = max(0, inventory.quantity - item_data.quantity)
    
    # Calcular totales de la venta
    totals = calculate_sale_totals(items_subtotal, items_iva, sale.document_type)
    db_sale.subtotal = totals["subtotal"]
    db_sale.iva_amount = totals["iva_amount"]
    db_sale.total = totals["total"]
    
    db.commit()
    db.refresh(db_sale)
    return get_sale(db, db_sale.id)


def update_sale(db: Session, sale_id: int, sale_update: schemas.SaleUpdate):
    db_sale = get_sale(db, sale_id)
    if not db_sale:
        return None
    
    update_data = sale_update.model_dump(exclude_unset=True, exclude={'items'})
    
    for key, value in update_data.items():
        setattr(db_sale, key, value)
    
    # Si se actualizan los items, recalcular
    if sale_update.items is not None:
        # Revertir inventario de items anteriores
        for old_item in db_sale.items:
            inventory = db.query(models.Inventory).filter(
                models.Inventory.medicine_id == old_item.medicine_id
            ).first()
            if inventory:
                inventory.quantity += old_item.quantity
        
        # Eliminar items anteriores
        db.query(models.SaleItem).filter(models.SaleItem.sale_id == sale_id).delete()
        
        # Crear nuevos items
        items_subtotal = 0.0
        items_iva = 0.0
        for item_data in sale_update.items:
            # Obtener el medicamento para saber su tasa de IVA
            medicine = db.query(models.Medicine).filter(models.Medicine.id == item_data.medicine_id).first()
            product_iva_rate = medicine.iva_rate if medicine else 0.0
            
            item_subtotal = (item_data.quantity * item_data.unit_price) - item_data.discount
            item_iva = item_subtotal * product_iva_rate
            items_subtotal += item_subtotal
            items_iva += item_iva
            
            db_item = models.SaleItem(
                sale_id=sale_id,
                medicine_id=item_data.medicine_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                discount=item_data.discount,
                iva_rate=product_iva_rate,
                subtotal=item_subtotal,
                iva_amount=item_iva
            )
            db.add(db_item)
            
            # Actualizar inventario
            inventory = db.query(models.Inventory).filter(
                models.Inventory.medicine_id == item_data.medicine_id
            ).first()
            if inventory:
                inventory.quantity = max(0, inventory.quantity - item_data.quantity)
        
        # Recalcular totales
        totals = calculate_sale_totals(items_subtotal, items_iva, db_sale.document_type)
        db_sale.subtotal = totals["subtotal"]
        db_sale.iva_amount = totals["iva_amount"]
        db_sale.total = totals["total"]
    
    db.commit()
    return get_sale(db, sale_id)


def delete_sale(db: Session, sale_id: int):
    db_sale = get_sale(db, sale_id)
    if db_sale:
        # Revertir cambios en inventario
        for item in db_sale.items:
            inventory = db.query(models.Inventory).filter(
                models.Inventory.medicine_id == item.medicine_id
            ).first()
            if inventory:
                inventory.quantity += item.quantity
        
        db.delete(db_sale)
        db.commit()
    return db_sale


def get_sales_by_client(db: Session, client_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).options(
        joinedload(models.Sale.items).joinedload(models.SaleItem.medicine),
        joinedload(models.Sale.client),
        joinedload(models.Sale.user)
    ).filter(models.Sale.client_id == client_id).order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()


def get_sales_by_medicine(db: Session, medicine_id: int, skip: int = 0, limit: int = 100):
    """Obtiene ventas que contienen un medicamento específico"""
    return db.query(models.Sale).options(
        joinedload(models.Sale.items).joinedload(models.SaleItem.medicine),
        joinedload(models.Sale.client),
        joinedload(models.Sale.user)
    ).join(models.SaleItem).filter(
        models.SaleItem.medicine_id == medicine_id
    ).order_by(models.Sale.sale_date.desc()).offset(skip).limit(limit).all()
