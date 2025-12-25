"""
Invoices router with multi-tenant support.
CFDI electronic invoicing.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core import models
from backend.core.dependencies import get_db
from backend.core.schemas import Invoice, InvoiceCreate, InvoiceUpdate
from backend.core.security import get_current_user

router = APIRouter()


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id


@router.get("/", response_model=list[Invoice])
def read_invoices(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Invoice).filter(models.Invoice.tenant_id == tenant_id).offset(skip).limit(limit).all()


@router.post("/", response_model=Invoice)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    db_invoice = models.Invoice(tenant_id=tenant_id, **invoice.model_dump(exclude={"concepts", "taxes"}))
    db.add(db_invoice)
    db.flush()

    if invoice.concepts:
        for concept in invoice.concepts:
            db_concept = models.InvoiceConcept(tenant_id=tenant_id, invoice_id=db_invoice.id, **concept.model_dump())
            db.add(db_concept)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice


@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    invoice = (
        db.query(models.Invoice).filter(models.Invoice.id == invoice_id, models.Invoice.tenant_id == tenant_id).first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@router.put("/{invoice_id}", response_model=Invoice)
def update_invoice(
    invoice_id: int,
    invoice_update: InvoiceUpdate,
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
):
    invoice = (
        db.query(models.Invoice).filter(models.Invoice.id == invoice_id, models.Invoice.tenant_id == tenant_id).first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    for key, value in invoice_update.model_dump(exclude_unset=True, exclude={"concepts", "taxes"}).items():
        setattr(invoice, key, value)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db), tenant_id: int = Depends(get_tenant_id)):
    invoice = (
        db.query(models.Invoice).filter(models.Invoice.id == invoice_id, models.Invoice.tenant_id == tenant_id).first()
    )
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if invoice.status == "issued":
        raise HTTPException(status_code=400, detail="Cannot delete issued invoice")

    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted"}


@router.post("/from-sale/{sale_id}", response_model=Invoice)
def create_invoice_from_sale(
    sale_id: int,
    payment_form: str = "01",
    payment_method: str = "PUE",
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id),
):
    """Create invoice from existing sale"""
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id, models.Sale.tenant_id == tenant_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")

    existing = db.query(models.Invoice).filter(models.Invoice.sale_id == sale_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sale already invoiced")

    company = db.query(models.Company).filter(models.Company.tenant_id == tenant_id).first()
    if not company:
        raise HTTPException(status_code=400, detail="No company configured")

    invoice = models.Invoice(
        tenant_id=tenant_id,
        sale_id=sale_id,
        company_id=company.id,
        client_id=sale.client_id,
        subtotal=sale.subtotal,
        total=sale.total,
        iva_amount=sale.iva_amount,
        payment_form=payment_form,
        payment_method=payment_method,
        status="draft",
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice
