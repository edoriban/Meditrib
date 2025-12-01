from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas

from backend.core.crud import crud_sale, crud_medicines, crud_client

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    # Validar existencia de cliente
    db_client = crud_client.get_client(db, client_id=sale.client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Validar que hay al menos un item
    if not sale.items or len(sale.items) == 0:
        raise HTTPException(status_code=400, detail="Sale must have at least one item")
    
    # Validar existencia de medicamentos y stock
    for item in sale.items:
        db_medicine = crud_medicines.get_medicine(db, medicine_id=item.medicine_id)
        if not db_medicine:
            raise HTTPException(status_code=404, detail=f"Medicine with id {item.medicine_id} not found")
        
        # Validar stock disponible
        if db_medicine.inventory and db_medicine.inventory.quantity < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {db_medicine.name}. Available: {db_medicine.inventory.quantity}, Requested: {item.quantity}"
            )

    # Crear la venta (el CRUD maneja la actualización de inventario)
    created_sale = crud_sale.create_sale(db=db, sale=sale)
    return created_sale


@router.get("/", response_model=List[schemas.Sale])
def read_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sales = crud_sale.get_sales(db, skip=skip, limit=limit)
    return sales


@router.get("/{sale_id}", response_model=schemas.Sale)
def read_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    return db_sale


@router.put("/{sale_id}", response_model=schemas.Sale)
def update_sale(sale_id: int, sale: schemas.SaleUpdate, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    
    # Validar cliente si se actualiza
    if sale.client_id and not crud_client.get_client(db, client_id=sale.client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Validar items si se actualizan
    if sale.items:
        for item in sale.items:
            db_medicine = crud_medicines.get_medicine(db, medicine_id=item.medicine_id)
            if not db_medicine:
                raise HTTPException(status_code=404, detail=f"Medicine with id {item.medicine_id} not found")
    
    return crud_sale.update_sale(db=db, sale_id=sale_id, sale_update=sale)


@router.delete("/{sale_id}", response_model=schemas.Sale)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    # La eliminación revierte los cambios en inventario
    return crud_sale.delete_sale(db=db, sale_id=sale_id)


@router.get("/client/{client_id}", response_model=List[schemas.Sale])
def read_sales_by_client(client_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las ventas de un cliente específico"""
    sales = crud_sale.get_sales_by_client(db, client_id=client_id, skip=skip, limit=limit)
    return sales


@router.get("/medicine/{medicine_id}", response_model=List[schemas.Sale])
def read_sales_by_medicine(medicine_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todas las ventas que contienen un medicamento específico"""
    sales = crud_sale.get_sales_by_medicine(db, medicine_id=medicine_id, skip=skip, limit=limit)
    return sales
