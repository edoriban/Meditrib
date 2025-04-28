from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Actualizar importaciones
# Importar get_db desde core.dependencies
from backend.core.dependencies import get_db
from backend.core import models  # Importar modelos desde core
from backend.core.crud import crud_suppliers  # Importar funciones CRUD específicas

# Importar schemas desde core.schemas
from backend.core import schemas

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    # dependencies=[Depends(get_current_user)], # Example dependency
    responses={404: {"description": "Not found"}},
)


# Ejemplo de ruta usando las nuevas importaciones
@router.get("/", response_model=List[schemas.Supplier])  # Usar schemas importado
# Usar get_db importado
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Llamar a la función CRUD importada
    suppliers = crud_suppliers.get_suppliers(db, skip=skip, limit=limit)
    return suppliers
    # return [{"name": "Placeholder Supplier - Updated Imports"}] # Placeholder return


# Implementación de rutas CRUD faltantes
@router.post("/", response_model=schemas.Supplier)
def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    return crud_suppliers.create_supplier(db=db, supplier=supplier)


@router.get("/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud_suppliers.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return db_supplier


@router.put("/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(supplier_id: int, supplier: schemas.SupplierUpdate, db: Session = Depends(get_db)):
    db_supplier = crud_suppliers.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return crud_suppliers.update_supplier(db=db, supplier_id=supplier_id, supplier=supplier)


@router.delete("/{supplier_id}", response_model=schemas.Supplier)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = crud_suppliers.get_supplier(db, supplier_id=supplier_id)
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return crud_suppliers.delete_supplier(db=db, supplier_id=supplier_id)
