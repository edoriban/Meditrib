"""
Companies router with multi-tenant support.
Emisor fiscal data for CFDI invoicing.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core import models
from backend.core.dependencies import get_db
from backend.core.schemas import Company, CompanyCreate, CompanyUpdate
from backend.core.security import get_current_user

router = APIRouter()


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id


@router.get("/", response_model=list[Company])
def read_companies(db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    return db.query(models.Company).filter(models.Company.tenant_id == tenant_id).all()


@router.post("/", response_model=Company)
def create_company(company: CompanyCreate, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    db_company = models.Company(tenant_id=tenant_id, **company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


@router.get("/{company_id}", response_model=Company)
def read_company(company_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    company = (
        db.query(models.Company).filter(models.Company.id == company_id, models.Company.tenant_id == tenant_id).first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=Company)
def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
):
    company = (
        db.query(models.Company).filter(models.Company.id == company_id, models.Company.tenant_id == tenant_id).first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    for key, value in company_update.model_dump(exclude_unset=True).items():
        setattr(company, key, value)
    db.commit()
    db.refresh(company)
    return company


@router.delete("/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    company = (
        db.query(models.Company).filter(models.Company.id == company_id, models.Company.tenant_id == tenant_id).first()
    )
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    db.delete(company)
    db.commit()
    return {"message": "Company deleted"}
