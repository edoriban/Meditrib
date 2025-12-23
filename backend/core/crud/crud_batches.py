from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import List, Optional
from backend.core.models import ProductBatch, BatchStockMovement, Product
from backend.core.schemas import ProductBatchCreate, ProductBatchUpdate, BatchStockMovementCreate, BatchStockMovementUpdate
from backend.core.logging_config import log_user_action


def get_product_batches(db: Session, product_id: Optional[int] = None) -> List[ProductBatch]:
    """Obtener lotes de medicamentos, opcionalmente filtrados por medicamento"""
    query = db.query(ProductBatch)
    if product_id:
        query = query.filter(ProductBatch.product_id == product_id)
    return query.order_by(ProductBatch.expiration_date).all()


def get_product_batch(db: Session, batch_id: int) -> Optional[ProductBatch]:
    """Obtener un lote específico"""
    return db.query(ProductBatch).filter(ProductBatch.id == batch_id).first()


def create_product_batch(db: Session, batch: ProductBatchCreate, user_id: int) -> ProductBatch:
    """Crear un nuevo lote de medicamento"""
    db_batch = ProductBatch(**batch.model_dump())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    # Registrar movimiento inicial de entrada
    if batch.quantity_received > 0:
        create_batch_movement(
            db,
            BatchStockMovementCreate(
                batch_id=db_batch.id,
                movement_type="in",
                quantity=batch.quantity_received,
                previous_quantity=0,
                new_quantity=batch.quantity_received,
                reason="batch_creation",
                user_id=user_id
            )
        )

    # Log de auditoría
    log_user_action(
        user_id=user_id,
        user_email="",  # Se obtendría del contexto
        action="create",
        resource="product_batch",
        resource_id=str(db_batch.id),
        new_values=batch.model_dump()
    )

    return db_batch


def update_product_batch(db: Session, batch_id: int, batch_update: ProductBatchUpdate, user_id: int) -> Optional[ProductBatch]:
    """Actualizar un lote de medicamento"""
    db_batch = db.query(ProductBatch).filter(ProductBatch.id == batch_id).first()
    if db_batch:
        old_values = {
            "batch_number": db_batch.batch_number,
            "expiration_date": db_batch.expiration_date.isoformat() if db_batch.expiration_date else None,
            "quantity_remaining": db_batch.quantity_remaining
        }

        update_data = batch_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_batch, key, value)

        db.commit()
        db.refresh(db_batch)

        # Log de auditoría
        log_user_action(
            user_id=user_id,
            user_email="",
            action="update",
            resource="product_batch",
            resource_id=str(batch_id),
            old_values=old_values,
            new_values=update_data
        )

    return db_batch


def delete_product_batch(db: Session, batch_id: int, user_id: int) -> bool:
    """Eliminar un lote (solo si no tiene movimientos)"""
    db_batch = db.query(ProductBatch).filter(ProductBatch.id == batch_id).first()
    if db_batch:
        # Verificar si tiene movimientos
        movements_count = db.query(BatchStockMovement).filter(BatchStockMovement.batch_id == batch_id).count()
        if movements_count > 0:
            return False  # No se puede eliminar si tiene movimientos

        db.delete(db_batch)
        db.commit()

        # Log de auditoría
        log_user_action(
            user_id=user_id,
            user_email="",
            action="delete",
            resource="product_batch",
            resource_id=str(batch_id)
        )

        return True
    return False


# Batch Stock Movements
def get_batch_movements(db: Session, batch_id: Optional[int] = None) -> List[BatchStockMovement]:
    """Obtener movimientos de stock por lote"""
    query = db.query(BatchStockMovement)
    if batch_id:
        query = query.filter(BatchStockMovement.batch_id == batch_id)
    return query.order_by(BatchStockMovement.movement_date.desc()).all()


def create_batch_movement(db: Session, movement: BatchStockMovementCreate) -> BatchStockMovement:
    """Crear un movimiento de stock para un lote"""
    db_movement = BatchStockMovement(**movement.model_dump())
    db.add(db_movement)

    # Actualizar cantidad restante del lote
    db_batch = db.query(ProductBatch).filter(ProductBatch.id == movement.batch_id).first()
    if db_batch:
        if movement.movement_type == "in":
            db_batch.quantity_remaining += movement.quantity
        elif movement.movement_type == "out":
            db_batch.quantity_remaining -= movement.quantity
        elif movement.movement_type == "adjustment":
            db_batch.quantity_remaining = movement.new_quantity

    db.commit()
    db.refresh(db_movement)
    return db_movement


# Advanced batch operations
def get_expiring_batches(db: Session, days_ahead: int = 30) -> List[ProductBatch]:
    """Obtener lotes próximos a expirar"""
    cutoff_date = date.today() + timedelta(days=days_ahead)
    return db.query(ProductBatch).filter(
        ProductBatch.expiration_date <= cutoff_date,
        ProductBatch.quantity_remaining > 0
    ).order_by(ProductBatch.expiration_date).all()


def get_batches_by_product(db: Session, product_id: int) -> List[ProductBatch]:
    """Obtener todos los lotes de un medicamento específico"""
    return db.query(ProductBatch).filter(
        ProductBatch.product_id == product_id,
        ProductBatch.quantity_remaining > 0
    ).order_by(ProductBatch.expiration_date).all()


def allocate_batch_for_sale(db: Session, product_id: int, quantity_needed: int, user_id: int) -> List[dict]:
    """
    Asignar lotes para una venta usando FIFO (First In, First Out)
    Retorna lista de asignaciones: [{"batch_id": id, "quantity": qty}, ...]
    """
    batches = get_batches_by_product(db, product_id)
    allocations = []
    remaining_needed = quantity_needed

    for batch in batches:
        if remaining_needed <= 0:
            break

        available_qty = min(batch.quantity_remaining, remaining_needed)

        if available_qty > 0:
            # Crear movimiento de salida
            create_batch_movement(
                db,
                BatchStockMovementCreate(
                    batch_id=batch.id,
                    movement_type="out",
                    quantity=available_qty,
                    previous_quantity=batch.quantity_remaining,
                    new_quantity=batch.quantity_remaining - available_qty,
                    reason="sale",
                    user_id=user_id
                )
            )

            allocations.append({
                "batch_id": batch.id,
                "quantity": available_qty,
                "batch_number": batch.batch_number,
                "expiration_date": batch.expiration_date.isoformat()
            })

            remaining_needed -= available_qty

    if remaining_needed > 0:
        raise ValueError(f"Insufficient stock for product {product_id}. Needed: {quantity_needed}, Available: {quantity_needed - remaining_needed}")

    return allocations


def get_batch_inventory_summary(db: Session) -> dict:
    """Obtener resumen de inventario por lotes"""
    # Total de lotes activos
    total_batches = db.query(ProductBatch).filter(ProductBatch.quantity_remaining > 0).count()

    # Lotes próximos a expirar (30 días)
    expiring_soon = len(get_expiring_batches(db, 30))

    # Valor total del inventario por lotes
    batches = db.query(ProductBatch).filter(ProductBatch.quantity_remaining > 0).all()
    total_value = sum(batch.quantity_remaining * (batch.unit_cost or 0) for batch in batches)

    # Lotes por medicamento
    product_batch_counts = db.query(
        ProductBatch.product_id,
        func.count(ProductBatch.id).label('batch_count'),
        func.sum(ProductBatch.quantity_remaining).label('total_quantity')
    ).filter(ProductBatch.quantity_remaining > 0).group_by(ProductBatch.product_id).all()

    return {
        "total_active_batches": total_batches,
        "expiring_within_30_days": expiring_soon,
        "total_inventory_value": total_value,
        "products_with_batches": len(product_batch_counts),
        "batch_distribution": [
            {
                "product_id": row.product_id,
                "batch_count": row.batch_count,
                "total_quantity": row.total_quantity or 0
            } for row in product_batch_counts
        ]
    }


def validate_batch_expiration(db: Session, batch_id: int) -> dict:
    """Validar si un lote está expirado o próximo a expirar"""
    batch = get_product_batch(db, batch_id)
    if not batch:
        return {"valid": False, "status": "not_found"}

    today = date.today()
    days_until_expiry = (batch.expiration_date - today).days

    if batch.expiration_date < today:
        return {
            "valid": False,
            "status": "expired",
            "days_until_expiry": days_until_expiry,
            "expiration_date": batch.expiration_date.isoformat()
        }
    elif days_until_expiry <= 30:
        return {
            "valid": True,
            "status": "expiring_soon",
            "days_until_expiry": days_until_expiry,
            "expiration_date": batch.expiration_date.isoformat()
        }
    else:
        return {
            "valid": True,
            "status": "valid",
            "days_until_expiry": days_until_expiry,
            "expiration_date": batch.expiration_date.isoformat()
        }