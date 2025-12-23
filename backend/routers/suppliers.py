"""
Suppliers router with multi-tenant support.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core.security import get_current_user
from backend.core import models, schemas

router = APIRouter(
    prefix="/suppliers",
    tags=["suppliers"],
    responses={404: {"description": "Not found"}},
)


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id


@router.get("/", response_model=List[schemas.Supplier])
def read_suppliers(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Supplier).filter(
        models.Supplier.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.Supplier)
def create_supplier(
    supplier: schemas.SupplierCreate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_supplier = models.Supplier(tenant_id=tenant_id, **supplier.model_dump())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier


@router.get("/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id,
        models.Supplier.tenant_id == tenant_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return supplier


@router.put("/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(
    supplier_id: int, 
    supplier_update: schemas.SupplierUpdate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id,
        models.Supplier.tenant_id == tenant_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    
    for key, value in supplier_update.model_dump(exclude_unset=True).items():
        setattr(supplier, key, value)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}", response_model=schemas.Supplier)
def delete_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    supplier = db.query(models.Supplier).filter(
        models.Supplier.id == supplier_id,
        models.Supplier.tenant_id == tenant_id
    ).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(supplier)
    db.commit()
    return supplier
