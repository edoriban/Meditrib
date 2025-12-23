"""
Clients router with multi-tenant support.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.core.dependencies import get_db
from backend.core import schemas, models
from backend.core.security import get_current_user

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id


# ============================================================================
# SCHEMAS
# ============================================================================

class FiscalValidationResult(BaseModel):
    valid: bool
    errors: List[str]
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


# ============================================================================
# CRUD ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[schemas.Client])
def read_clients(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Client).filter(
        models.Client.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()


@router.post("/", response_model=schemas.Client)
def create_client(
    client: schemas.ClientCreate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    existing = db.query(models.Client).filter(
        models.Client.tenant_id == tenant_id,
        models.Client.name == client.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client name already registered")
    
    db_client = models.Client(tenant_id=tenant_id, **client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/{client_id}", response_model=schemas.Client)
def read_client(
    client_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == tenant_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.put("/{client_id}", response_model=schemas.Client)
def update_client(
    client_id: int, 
    client_update: schemas.ClientUpdate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == tenant_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    if client_update.name:
        existing = db.query(models.Client).filter(
            models.Client.tenant_id == tenant_id,
            models.Client.name == client_update.name,
            models.Client.id != client_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Client name already registered")
    
    for key, value in client_update.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", response_model=schemas.Client)
def delete_client(
    client_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == tenant_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return client


# ============================================================================
# FISCAL VALIDATION
# ============================================================================

@router.get("/{client_id}/validate-fiscal", response_model=FiscalValidationResult)
def validate_client_fiscal_data(
    client_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == tenant_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    errors = []
    if not client.rfc or len(client.rfc) < 12:
        errors.append("RFC inválido o faltante")
    if not client.tax_regime:
        errors.append("Régimen fiscal faltante")
    if not client.cfdi_use:
        errors.append("Uso de CFDI faltante")
    if not client.fiscal_street:
        errors.append("Calle fiscal faltante")
    if not client.fiscal_postal_code or len(client.fiscal_postal_code) != 5:
        errors.append("Código postal inválido")
    
    return FiscalValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        client_id=client_id,
        client_name=client.name,
        can_invoice=len(errors) == 0
    )


@router.get("/{client_id}/fiscal-data", response_model=ClientFiscalData)
def get_client_fiscal_data(
    client_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == tenant_id
    ).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    return ClientFiscalData(
        rfc=client.rfc,
        tax_regime=client.tax_regime,
        cfdi_use=client.cfdi_use,
        fiscal_street=client.fiscal_street,
        fiscal_exterior_number=client.fiscal_exterior_number,
        fiscal_interior_number=client.fiscal_interior_number,
        fiscal_neighborhood=client.fiscal_neighborhood,
        fiscal_city=client.fiscal_city,
        fiscal_state=client.fiscal_state,
        fiscal_postal_code=client.fiscal_postal_code,
        fiscal_country=client.fiscal_country or "México"
    )
