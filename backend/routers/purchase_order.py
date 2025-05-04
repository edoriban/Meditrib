from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.core.crud import crud_purchase_order, crud_suppliers

router = APIRouter(
    prefix="/purchase-orders",
    tags=["purchase-orders"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.PurchaseOrder)
def create_purchase_order(order: schemas.PurchaseOrderCreate, db: Session = Depends(get_db)):
    # Validar que el proveedor existe
    supplier = crud_suppliers.get_supplier(db, supplier_id=order.supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # TODO: Validar que los medicamentos existen
    
    return crud_purchase_order.create_purchase_order(db=db, purchase_order=order)


@router.get("/", response_model=List[schemas.PurchaseOrder])
def read_purchase_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = crud_purchase_order.get_purchase_orders(db, skip=skip, limit=limit)
    return orders


@router.get("/{order_id}", response_model=schemas.PurchaseOrder)
def read_purchase_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_purchase_order.get_purchase_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return db_order


@router.put("/{order_id}", response_model=schemas.PurchaseOrder)
def update_purchase_order(order_id: int, order: schemas.PurchaseOrderUpdate, db: Session = Depends(get_db)):
    db_order = crud_purchase_order.get_purchase_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    
    # Validar proveedor si se está actualizando
    if order.supplier_id and not crud_suppliers.get_supplier(db, supplier_id=order.supplier_id):
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    # TODO: Validar medicamentos si se actualizan los items
    
    return crud_purchase_order.update_purchase_order(db=db, order_id=order_id, purchase_order=order)


@router.delete("/{order_id}", response_model=schemas.PurchaseOrder)
def delete_purchase_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_purchase_order.get_purchase_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return crud_purchase_order.delete_purchase_order(db=db, order_id=order_id)


@router.get("/supplier/{supplier_id}", response_model=List[schemas.PurchaseOrder])
def read_purchase_orders_by_supplier(supplier_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    supplier = crud_suppliers.get_supplier(db, supplier_id=supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    orders = crud_purchase_order.get_purchase_orders_by_supplier(db, supplier_id=supplier_id, skip=skip, limit=limit)
    return orders


@router.get("/status/{status}", response_model=List[schemas.PurchaseOrder])
def read_purchase_orders_by_status(status: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = crud_purchase_order.get_purchase_orders_by_status(db, status=status, skip=skip, limit=limit)
    return orders