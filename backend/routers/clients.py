"""
Clients router with multi-tenant support.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core import models, schemas
from backend.core.dependencies import get_db, get_tenant_id

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)


class FiscalValidationResult(BaseModel):
    valid: bool
    errors: list[str]
    client_id: int
    client_name: str
    can_invoice: bool


class ClientFiscalData(BaseModel):
    rfc: str | None
    tax_regime: str | None
    cfdi_use: str | None
    fiscal_street: str | None
    fiscal_exterior_number: str | None
    fiscal_interior_number: str | None
    fiscal_neighborhood: str | None
    fiscal_city: str | None
    fiscal_state: str | None
    fiscal_postal_code: str | None
    fiscal_country: str | None


@router.get("/", response_model=list[schemas.Client])
def read_clients(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Client).filter(models.Client.tenant_id == tenant_id).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    existing = (
        db.query(models.Client).filter(models.Client.tenant_id == tenant_id, models.Client.name == client.name).first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Client name already registered")

    db_client = models.Client(tenant_id=tenant_id, **client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.tenant_id == tenant_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=schemas.Client)
def update_client(
    client_id: int,
    client_update: schemas.ClientUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
):
    client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.tenant_id == tenant_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    for key, value in client_update.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", response_model=schemas.Client)
def delete_client(client_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.tenant_id == tenant_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return client


@router.get("/{client_id}/validate-fiscal", response_model=FiscalValidationResult)
def validate_client_fiscal_data(client_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    client = db.query(models.Client).filter(models.Client.id == client_id, models.Client.tenant_id == tenant_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    errors = []
    if not client.rfc or len(client.rfc) < 12:
        errors.append("RFC inválido")
    if not client.tax_regime:
        errors.append("Régimen fiscal faltante")

    return FiscalValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        client_id=client_id,
        client_name=client.name,
        can_invoice=len(errors) == 0,
    )
