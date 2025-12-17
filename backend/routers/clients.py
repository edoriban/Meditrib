from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.core.crud import crud_client
from backend.core.security import get_current_user

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(get_current_user)],  # JWT auth required
)


# ============================================================================
# SCHEMAS DE VALIDACIÓN FISCAL
# ============================================================================

class FiscalValidationResult(BaseModel):
    """Resultado de validación de datos fiscales"""
    valid: bool
    errors: List[str]
    client_id: int
    client_name: str
    can_invoice: bool


class ClientFiscalData(BaseModel):
    """Datos fiscales del cliente"""
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
# ENDPOINTS DE VALIDACIÓN FISCAL
# ============================================================================

@router.get("/{client_id}/validate-fiscal", response_model=FiscalValidationResult)
def validate_client_fiscal_data(client_id: int, db: Session = Depends(get_db)):
    """
    Valida si un cliente tiene los datos fiscales completos para facturación.
    Requeridos para CFDI: RFC, régimen fiscal, uso de CFDI, calle y CP.
    """
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    errors = []
    
    # Validar RFC (12-13 caracteres)
    if not db_client.rfc or len(db_client.rfc) < 12:
        errors.append("RFC inválido o faltante (debe tener 12-13 caracteres)")
    
    # Validar régimen fiscal
    if not db_client.tax_regime:
        errors.append("Régimen fiscal faltante")
    
    # Validar uso de CFDI
    if not db_client.cfdi_use:
        errors.append("Uso de CFDI faltante")
    
    # Validar dirección fiscal
    if not db_client.fiscal_street:
        errors.append("Calle fiscal faltante")
    
    # Validar código postal (5 dígitos)
    if not db_client.fiscal_postal_code:
        errors.append("Código postal fiscal faltante")
    elif len(db_client.fiscal_postal_code) != 5 or not db_client.fiscal_postal_code.isdigit():
        errors.append("Código postal debe ser de 5 dígitos")
    
    return FiscalValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        client_id=client_id,
        client_name=db_client.name,
        can_invoice=len(errors) == 0
    )


@router.get("/{client_id}/fiscal-data", response_model=ClientFiscalData)
def get_client_fiscal_data(client_id: int, db: Session = Depends(get_db)):
    """Obtiene los datos fiscales de un cliente"""
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    return ClientFiscalData(
        rfc=db_client.rfc,
        tax_regime=db_client.tax_regime,
        cfdi_use=db_client.cfdi_use,
        fiscal_street=db_client.fiscal_street,
        fiscal_exterior_number=db_client.fiscal_exterior_number,
        fiscal_interior_number=db_client.fiscal_interior_number,
        fiscal_neighborhood=db_client.fiscal_neighborhood,
        fiscal_city=db_client.fiscal_city,
        fiscal_state=db_client.fiscal_state,
        fiscal_postal_code=db_client.fiscal_postal_code,
        fiscal_country=db_client.fiscal_country or "México"
    )


# ============================================================================
# ENDPOINTS CRUD BÁSICOS
# ============================================================================

@router.post("/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = crud_client.get_client_by_name(db, name=client.name)
    if db_client:
        raise HTTPException(status_code=400, detail="Client name already registered")
    return crud_client.create_client(db=db, client=client)


@router.get("/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = crud_client.get_clients(db, skip=skip, limit=limit)
    return clients


@router.get("/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client


@router.put("/{client_id}", response_model=schemas.Client)
def update_client(client_id: int, client: schemas.ClientUpdate, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    # Opcional: Verificar si el nuevo nombre ya existe si se está actualizando
    if client.name:
        existing_client = crud_client.get_client_by_name(db, name=client.name)
        if existing_client and existing_client.id != client_id:
            raise HTTPException(status_code=400, detail="Client name already registered")
    return crud_client.update_client(db=db, client_id=client_id, client_update=client)


@router.delete("/{client_id}", response_model=schemas.Client)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    # Considerar lógica adicional si el cliente tiene ventas asociadas
    return crud_client.delete_client(db=db, client_id=client_id)
