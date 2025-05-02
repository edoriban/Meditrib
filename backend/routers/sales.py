from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas

# Importar crud de sale, medicine, client, inventory si es necesario para validaciones
from backend.core.crud import crud_sale, crud_medicines, crud_client

router = APIRouter(
    prefix="/sales",
    tags=["sales"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Sale)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    # Validar existencia de medicina y cliente
    db_medicine = crud_medicines.get_medicine(db, medicine_id=sale.medicine_id)
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    db_client = crud_client.get_client(db, client_id=sale.client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Opcional: Validar inventario
    # db_inventory = crud_inventory.get_inventory_by_medicine(db, medicine_id=sale.medicine_id)
    # if not db_inventory or db_inventory.quantity < sale.quantity:
    #     raise HTTPException(status_code=400, detail="Insufficient inventory")

    # Crear la venta
    created_sale = crud_sale.create_sale(db=db, sale=sale)

    # Opcional: Actualizar inventario después de la venta
    # if db_inventory:
    #     inventory_update = schemas.InventoryUpdate(quantity=db_inventory.quantity - sale.quantity)
    #     crud_inventory.update_inventory(db=db, medicine_id=sale.medicine_id, inventory_update=inventory_update)

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
    # Añadir validaciones si se cambian medicine_id o client_id
    if sale.medicine_id and not crud_medicine.get_medicine(db, medicine_id=sale.medicine_id):
        raise HTTPException(status_code=404, detail="Medicine not found")
    if sale.client_id and not crud_client.get_client(db, client_id=sale.client_id):
        raise HTTPException(status_code=404, detail="Client not found")
    # Considerar lógica de inventario si la cantidad cambia
    return crud_sale.update_sale(db=db, sale_id=sale_id, sale_update=sale)


@router.delete("/{sale_id}", response_model=schemas.Sale)
def delete_sale(sale_id: int, db: Session = Depends(get_db)):
    db_sale = crud_sale.get_sale(db, sale_id=sale_id)
    if db_sale is None:
        raise HTTPException(status_code=404, detail="Sale not found")
    # Considerar si eliminar una venta debe revertir cambios en inventario
    return crud_sale.delete_sale(db=db, sale_id=sale_id)
