from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from backend.core.dependencies import get_db
from backend.core import models

router = APIRouter(
    prefix="/onboarding",
    tags=["onboarding"],
)


class OnboardingStatus(BaseModel):
    setup_completed: bool
    company_created: bool
    has_products: bool
    has_clients: bool


class CompanySetup(BaseModel):
    name: str
    rfc: Optional[str] = None
    tax_regime: Optional[str] = None
    street: Optional[str] = None
    exterior_number: Optional[str] = None
    interior_number: Optional[str] = None
    neighborhood: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


def get_setting(db: Session, key: str) -> Optional[str]:
    setting = db.query(models.AppSettings).filter(models.AppSettings.key == key).first()
    return setting.value if setting else None


def set_setting(db: Session, key: str, value: str):
    setting = db.query(models.AppSettings).filter(models.AppSettings.key == key).first()
    if setting:
        setting.value = value
        setting.updated_at = datetime.now()
    else:
        setting = models.AppSettings(key=key, value=value)
        db.add(setting)
    db.commit()


@router.get("/status", response_model=OnboardingStatus)
def get_onboarding_status(db: Session = Depends(get_db)):
    setup_completed = get_setting(db, "setup_completed") == "true"
    company_exists = db.query(models.Company).first() is not None
    products_exist = db.query(models.Product).first() is not None
    clients_exist = db.query(models.Client).first() is not None
    
    return OnboardingStatus(
        setup_completed=setup_completed,
        company_created=company_exists,
        has_products=products_exist,
        has_clients=clients_exist
    )


@router.post("/company")
def setup_company(company: CompanySetup, db: Session = Depends(get_db)):
    existing = db.query(models.Company).first()
    
    if existing:
        for key, value in company.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(existing, key, value)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_company = models.Company(
            name=company.name,
            rfc=company.rfc or "XAXX010101000",
            tax_regime=company.tax_regime or "601",
            street=company.street or "",
            exterior_number=company.exterior_number or "",
            neighborhood=company.neighborhood or "",
            city=company.city or "",
            state=company.state or "",
            postal_code=company.postal_code or "",
            email=company.email or "",
            phone=company.phone
        )
        db.add(db_company)
        db.commit()
        db.refresh(db_company)
        return db_company


@router.post("/default-client")
def create_default_client(db: Session = Depends(get_db)):
    existing = db.query(models.Client).filter(models.Client.name == "Público General").first()
    
    if existing:
        return existing
    
    default_client = models.Client(
        name="Público General",
        contact="Cliente de mostrador",
        rfc="XAXX010101000"
    )
    db.add(default_client)
    db.commit()
    db.refresh(default_client)
    return default_client


@router.post("/complete")
def complete_onboarding(db: Session = Depends(get_db)):
    set_setting(db, "setup_completed", "true")
    return {"message": "Onboarding completed successfully", "setup_completed": True}
