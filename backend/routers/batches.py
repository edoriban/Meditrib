from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from backend.core.database import get_db
from backend.core.schemas import MedicineBatch, MedicineBatchCreate, MedicineBatchUpdate, BatchStockMovement
from backend.core.crud.crud_batches import (
    get_medicine_batches, get_medicine_batch, create_medicine_batch,
    update_medicine_batch, delete_medicine_batch, get_batch_movements,
    get_expiring_batches, get_batches_by_medicine, get_batch_inventory_summary,
    validate_batch_expiration
)

router = APIRouter()


@router.post("/", response_model=MedicineBatch)
def create_batch(batch: MedicineBatchCreate, user_id: int = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Crear un nuevo lote de medicamento"""
    return create_medicine_batch(db, batch, user_id)


@router.get("/", response_model=List[MedicineBatch])
def read_batches(medicine_id: Optional[int] = None, db: Session = Depends(get_db)):
    """Obtener lotes de medicamentos"""
    return get_medicine_batches(db, medicine_id)


@router.get("/{batch_id}", response_model=MedicineBatch)
def read_batch(batch_id: int, db: Session = Depends(get_db)):
    """Obtener un lote específico"""
    db_batch = get_medicine_batch(db, batch_id)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.put("/{batch_id}", response_model=MedicineBatch)
def update_batch(batch_id: int, batch_update: MedicineBatchUpdate, user_id: int = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Actualizar un lote"""
    db_batch = update_medicine_batch(db, batch_id, batch_update, user_id)
    if db_batch is None:
        raise HTTPException(status_code=404, detail="Batch not found")
    return db_batch


@router.delete("/{batch_id}")
def delete_batch(batch_id: int, user_id: int = Query(..., description="User ID"), db: Session = Depends(get_db)):
    """Eliminar un lote (solo si no tiene movimientos)"""
    success = delete_medicine_batch(db, batch_id, user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete batch with stock movements")
    return {"message": "Batch deleted successfully"}


@router.get("/expiring/soon")
def get_expiring_soon_batches(days_ahead: int = Query(30, description="Days ahead to check"), db: Session = Depends(get_db)):
    """Obtener lotes próximos a expirar"""
    batches = get_expiring_batches(db, days_ahead)
    return {
        "count": len(batches),
        "batches": [
            {
                "id": batch.id,
                "medicine_name": batch.medicine.name,
                "batch_number": batch.batch_number,
                "expiration_date": batch.expiration_date.isoformat(),
                "quantity_remaining": batch.quantity_remaining,
                "days_until_expiry": (batch.expiration_date - date.today()).days
            } for batch in batches
        ]
    }


@router.get("/medicine/{medicine_id}/batches")
def get_medicine_batches_list(medicine_id: int, db: Session = Depends(get_db)):
    """Obtener lotes disponibles para un medicamento"""
    batches = get_batches_by_medicine(db, medicine_id)
    return {
        "medicine_id": medicine_id,
        "total_batches": len(batches),
        "total_quantity": sum(batch.quantity_remaining for batch in batches),
        "batches": [
            {
                "id": batch.id,
                "batch_number": batch.batch_number,
                "expiration_date": batch.expiration_date.isoformat(),
                "quantity_remaining": batch.quantity_remaining,
                "unit_cost": batch.unit_cost,
                "supplier_name": batch.supplier.name if batch.supplier else None
            } for batch in batches
        ]
    }


@router.get("/inventory/summary")
def get_inventory_summary(db: Session = Depends(get_db)):
    """Obtener resumen de inventario por lotes"""
    return get_batch_inventory_summary(db)


@router.get("/{batch_id}/validate")
def validate_batch(batch_id: int, db: Session = Depends(get_db)):
    """Validar estado de expiración de un lote"""
    return validate_batch_expiration(db, batch_id)


@router.get("/{batch_id}/movements", response_model=List[BatchStockMovement])
def get_batch_movements_list(batch_id: int, db: Session = Depends(get_db)):
    """Obtener movimientos de stock para un lote"""
    return get_batch_movements(db, batch_id)