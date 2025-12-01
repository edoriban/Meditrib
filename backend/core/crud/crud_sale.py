from sqlalchemy.orm import Session
from backend.core import models, schemas
from typing import List, Optional
from datetime import datetime


def calculate_sale_totals(subtotal: float, iva_rate: float, document_type: str) -> dict:
    """Calcula los totales de una venta basado en el tipo de documento"""
    if document_type == "remission":
        # Nota de remisión: sin IVA
        iva_amount = 0.0
        total_with_iva = subtotal
        total_price = subtotal  # Para compatibilidad
    else:
        # Factura con IVA
        iva_amount = subtotal * iva_rate
        total_with_iva = subtotal + iva_amount
        total_price = total_with_iva  # Para compatibilidad

    return {
        "iva_amount": iva_amount,
        "total_with_iva": total_with_iva,
        "total_price": total_price
    }


def get_sale(db: Session, sale_id: int):
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()


def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sale).offset(skip).limit(limit).all()


def create_sale(db: Session, sale: schemas.SaleCreate):
    # Calcular totales basado en el tipo de documento
    totals = calculate_sale_totals(sale.subtotal, sale.iva_rate, sale.document_type)

    db_sale = models.Sale(
        **sale.model_dump(),
        **totals
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    return db_sale


def update_sale(db: Session, sale_id: int, sale_update: schemas.SaleUpdate):
    db_sale = get_sale(db, sale_id)
    if db_sale:
        update_data = sale_update.model_dump(exclude_unset=True)

        # Si se actualiza subtotal, iva_rate o document_type, recalcular totales
        needs_recalc = any(key in update_data for key in ['subtotal', 'iva_rate', 'document_type'])

        for key, value in update_data.items():
            setattr(db_sale, key, value)

        if needs_recalc:
            totals = calculate_sale_totals(
                db_sale.subtotal,
                db_sale.iva_rate,
                db_sale.document_type
            )
            for key, value in totals.items():
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
