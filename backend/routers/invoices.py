from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.core.schemas import Invoice, InvoiceCreate, InvoiceUpdate, Company, CompanyCreate
from backend.core.crud.crud_invoice import (
    get_invoices, get_invoice, create_invoice, update_invoice,
    delete_invoice, generate_cfdi_xml, create_company, get_company,
    get_companies, create_invoice_from_sale
)

router = APIRouter()


# Company endpoints
@router.post("/companies/", response_model=Company)
def create_new_company(company: CompanyCreate, db: Session = Depends(get_db)):
    return create_company(db, company)


@router.get("/companies/", response_model=List[Company])
def read_companies(db: Session = Depends(get_db)):
    return get_companies(db)


@router.get("/companies/{company_id}", response_model=Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company


# Invoice endpoints
@router.get("/", response_model=List[Invoice])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    invoices = get_invoices(db, skip=skip, limit=limit)
    return invoices


@router.get("/{invoice_id}", response_model=Invoice)
def read_invoice(invoice_id: int, db: Session = Depends(get_db)):
    db_invoice = get_invoice(db, invoice_id=invoice_id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice


@router.post("/", response_model=Invoice)
def create_new_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db)):
    return create_invoice(db, invoice)


@router.put("/{invoice_id}", response_model=Invoice)
def update_existing_invoice(invoice_id: int, invoice: InvoiceUpdate, db: Session = Depends(get_db)):
    db_invoice = update_invoice(db, invoice_id=invoice_id, invoice_update=invoice)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice


@router.delete("/{invoice_id}")
def delete_existing_invoice(invoice_id: int, db: Session = Depends(get_db)):
    success = delete_invoice(db, invoice_id=invoice_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete issued invoice")
    return {"message": "Invoice deleted successfully"}


@router.post("/{invoice_id}/generate-xml")
def generate_invoice_xml(invoice_id: int, db: Session = Depends(get_db)):
    xml_content = generate_cfdi_xml(db, invoice_id)
    if xml_content is None:
        raise HTTPException(status_code=400, detail="Cannot generate XML for this invoice")
    return {"xml": xml_content}


@router.post("/from-sale/{sale_id}", response_model=Invoice)
def create_invoice_from_sale_endpoint(sale_id: int, payment_form: str = "01", payment_method: str = "PUE", db: Session = Depends(get_db)):
    result = create_invoice_from_sale(db, sale_id, payment_form, payment_method)
    
    # Si el resultado es un dict con error, devolver el mensaje apropiado
    if isinstance(result, dict) and "error" in result:
        error_codes = {
            "sale_not_found": 404,
            "already_invoiced": 400,
            "no_company": 400
        }
        status_code = error_codes.get(result["error"], 400)
        raise HTTPException(status_code=status_code, detail=result["message"])
    
    if result is None:
        raise HTTPException(status_code=400, detail="Cannot create invoice from sale")
    
    return result