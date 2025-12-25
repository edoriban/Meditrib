from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.crud.crud_batches import (
    create_product_batch,
    delete_product_batch,
    get_batch_inventory_summary,
    get_batch_movements,
    get_batches_by_product,
    get_expiring_batches,
    get_product_batch,
    get_product_batches,
    update_product_batch,
    validate_batch_expiration,
)
from backend.core.database import get_db
from backend.core.schemas import BatchStockMovement, ProductBatch, ProductBatchCreate, ProductBatchUpdate

router = APIRouter()


@router.post("/", response_model=ProductBatch)
def create_batch(
    batch: ProductBatchCreate, user_id: int = Query(..., description="User ID"), db: Session = Depends(get_db)
):
    """Crear un nuevo lote de medicamento"""
    return create_product_batch(db, batch, user_id)


@router.get("/", response_model=list[ProductBatch])
def read_batches(product_id: int | None = None, db: Session = Depends(get_db)):
    """Obtener lotes de medicamentos"""
    return get_product_batches(db, product_id)


@router.get("/{batch_id}", response_model=ProductBatch)
def read_batch(batch_id: int, db: Session = Depends(get_db)):
    """Obtener un lote específico"""
    db_batch = get_product_batch(db, batch_id)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.put("/{batch_id}", response_model=ProductBatch)
def update_batch(
    batch_id: int,
    batch_update: ProductBatchUpdate,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db),
):
    """Actualizar un lote"""
    db_batch = update_product_batch(db, batch_id, batch_update, user_id)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.delete("/{batch_id}")
def delete_batch(batch_id: int, user_id: int = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Eliminar un lote (solo si no tiene movimientos)"""
    success = delete_product_batch(db, batch_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete batch with stock movements")
    return {"message": "Batch deleted successfully"}


@router.get("/expiring/soon")
def get_expiring_soon_batches(
    days_ahead: int = Query(30, description="Days ahead to check"), db: Session = Depends(get_db)
):
    """Obtener lotes próximos a expirar"""
    batches = get_expiring_batches(db, days_ahead)
    return {
        "count": len(batches),
        "batches": [
            {
                "id": batch.id,
                "product_name": batch.product.name,
                "batch_number": batch.batch_number,
                "expiration_date": batch.expiration_date.isoformat(),
                "quantity_remaining": batch.quantity_remaining,
                "days_until_expiry": (batch.expiration_date - date.today()).days,
            }
            for batch in batches
        ],
    }


@router.get("/product/{product_id}/batches")
def get_product_batches_list(product_id: int, db: Session = Depends(get_db)):
    """Obtener lotes disponibles para un medicamento"""
    batches = get_batches_by_product(db, product_id)
    return {
        "product_id": product_id,
        "total_batches": len(batches),
        "total_quantity": sum(batch.quantity_remaining for batch in batches),
        "batches": [
            {
                "id": batch.id,
                "batch_number": batch.batch_number,
                "expiration_date": batch.expiration_date.isoformat(),
                "quantity_remaining": batch.quantity_remaining,
                "unit_cost": batch.unit_cost,
                "supplier_name": batch.supplier.name if batch.supplier else None,
            }
            for batch in batches
        ],
    }


@router.get("/inventory/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    """Obtener resumen de inventario por lotes"""
    return get_batch_inventory_summary(db)


@router.get("/{batch_id}/validate")
def validate_batch(batch_id: int, db: Session = Depends(get_db)):
    """Validar estado de expiración de un lote"""
    return validate_batch_expiration(db, batch_id)


@router.get("/{batch_id}/movements", response_model=list[BatchStockMovement])
def get_batch_movements_list(batch_id: int, db: Session = Depends(get_db)):
    """Obtener movimientos de stock para un lote"""
    return get_batch_movements(db, batch_id)
