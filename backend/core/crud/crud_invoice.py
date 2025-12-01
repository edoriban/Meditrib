from sqlalchemy.orm import Session
from backend.core.models import Invoice, InvoiceConcept, InvoiceTax, Company, Client, Sale
from backend.core.schemas import InvoiceCreate, InvoiceUpdate, CompanyCreate
from typing import List, Optional
from datetime import datetime
import uuid
import xml.etree.ElementTree as ET
from decimal import Decimal


def get_invoices(db: Session, skip: int = 0, limit: int = 100) -> List[Invoice]:
    return db.query(Invoice).offset(skip).limit(limit).all()


def get_invoice(db: Session, invoice_id: int) -> Optional[Invoice]:
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()


def create_invoice(db: Session, invoice: InvoiceCreate) -> Invoice:
    # Generar folio único si no se proporciona
    if not invoice.folio:
        # Obtener el último folio de la serie
        last_invoice = db.query(Invoice).filter(Invoice.serie == invoice.serie).order_by(Invoice.id.desc()).first()
        folio_number = 1 if not last_invoice else int(last_invoice.folio or "0") + 1
        folio = f"{folio_number:06d}"  # Formato 000001, 000002, etc.
    else:
        folio = invoice.folio

    db_invoice = Invoice(
        **invoice.model_dump(exclude={"concepts", "taxes"}),
        folio=folio
    )

    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)

    # Crear conceptos
    for concept_data in invoice.concepts:
        concept = InvoiceConcept(**concept_data.model_dump(), invoice_id=db_invoice.id)
        db.add(concept)

    # Crear impuestos
    for tax_data in invoice.taxes:
        tax = InvoiceTax(**tax_data.model_dump(), invoice_id=db_invoice.id)
        db.add(tax)

    db.commit()
    db.refresh(db_invoice)
    return db_invoice


def update_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate) -> Optional[Invoice]:
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if db_invoice:
        for key, value in invoice_update.model_dump(exclude_unset=True).items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice


def delete_invoice(db: Session, invoice_id: int) -> bool:
    db_invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if db_invoice and db_invoice.status == "draft":
        db.delete(db_invoice)
        db.commit()
        return True
    return False


def generate_cfdi_xml(db: Session, invoice_id: int) -> Optional[str]:
    """Generar XML CFDI 4.0 para la factura"""
    invoice = get_invoice(db, invoice_id)
    if not invoice or invoice.status != "draft":
        return None

    # Crear estructura XML básica
    root = ET.Element("cfdi:Comprobante")
    root.set("xmlns:cfdi", "http://www.sat.gob.mx/cfd/4")
    root.set("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
    root.set("xsi:schemaLocation", "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd")
    root.set("Version", "4.0")

    # Atributos del comprobante
    root.set("Serie", invoice.serie)
    root.set("Folio", invoice.folio)
    root.set("Fecha", invoice.issue_date.strftime("%Y-%m-%dT%H:%M:%S"))
    root.set("FormaPago", invoice.payment_form)
    root.set("MetodoPago", invoice.payment_method)
    root.set("Moneda", invoice.currency)
    if invoice.currency != "MXN":
        root.set("TipoCambio", str(invoice.exchange_rate))
    root.set("SubTotal", str(invoice.subtotal))
    root.set("Total", str(invoice.total))

    # Emisor
    emisor = ET.SubElement(root, "cfdi:Emisor")
    emisor.set("Rfc", invoice.company.rfc)
    emisor.set("Nombre", invoice.company.name)
    emisor.set("RegimenFiscal", invoice.company.tax_regime)

    # Receptor
    receptor = ET.SubElement(root, "cfdi:Receptor")
    receptor.set("Rfc", invoice.client.rfc or "XAXX010101000")
    receptor.set("Nombre", invoice.client.name)
    receptor.set("UsoCFDI", invoice.client.cfdi_use or "G01")

    # Conceptos
    conceptos = ET.SubElement(root, "cfdi:Conceptos")
    for concept in invoice.concepts:
        concepto = ET.SubElement(conceptos, "cfdi:Concepto")
        concepto.set("ClaveProdServ", "01010101")  # Clave genérica para medicamentos
        concepto.set("Cantidad", str(concept.quantity))
        concepto.set("ClaveUnidad", "H87")  # Pieza
        concepto.set("Unidad", concept.unit)
        concepto.set("Descripcion", concept.description)
        concepto.set("ValorUnitario", str(concept.unit_price))
        concepto.set("Importe", str(concept.amount))
        if concept.discount > 0:
            concepto.set("Descuento", str(concept.discount))

    # Impuestos
    if invoice.taxes:
        impuestos = ET.SubElement(root, "cfdi:Impuestos")
        impuestos.set("TotalImpuestosTrasladados", str(invoice.total_taxes))

        traslados = ET.SubElement(impuestos, "cfdi:Traslados")
        for tax in invoice.taxes:
            traslado = ET.SubElement(traslados, "cfdi:Traslado")
            traslado.set("Base", str(tax.tax_base))
            traslado.set("Impuesto", tax.tax_type)
            traslado.set("TipoFactor", "Tasa")
            traslado.set("TasaOCuota", str(tax.tax_rate))
            traslado.set("Importe", str(tax.tax_amount))

    # Convertir a string XML
    xml_str = ET.tostring(root, encoding="unicode", method="xml")

    # Actualizar la factura con el XML generado
    update_invoice(db, invoice_id, InvoiceUpdate(
        status="issued",
        cfdi_xml=xml_str,
        certification_date=datetime.now()
    ))

    return xml_str


def create_company(db: Session, company: CompanyCreate) -> Company:
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def get_company(db: Session, company_id: int) -> Optional[Company]:
    return db.query(Company).filter(Company.id == company_id).first()


def get_companies(db: Session) -> List[Company]:
    return db.query(Company).all()


def create_invoice_from_sale(db: Session, sale_id: int, payment_form: str = "01", payment_method: str = "PUE") -> Optional[Invoice]:
    """Crear factura automáticamente desde una venta"""
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        return None

    # Obtener la primera empresa (por ahora asumimos una sola)
    company = db.query(Company).first()
    if not company:
        return None

    # Calcular subtotal y total (con IVA 16%)
    subtotal = sale.total_price
    iva_rate = 0.16
    iva_amount = subtotal * iva_rate
    total = subtotal + iva_amount

    # Crear conceptos desde la venta
    concepts = [
        {
            "quantity": sale.quantity,
            "unit": "PIEZA",
            "description": f"{sale.medicine.name} - {sale.medicine.description or ''}",
            "unit_price": sale.total_price / sale.quantity,
            "amount": sale.total_price,
            "medicine_id": sale.medicine_id
        }
    ]

    # Crear impuestos
    taxes = [
        {
            "tax_type": "002",  # IVA
            "tax_rate": iva_rate,
            "tax_amount": iva_amount,
            "tax_base": subtotal
        }
    ]

    invoice_data = InvoiceCreate(
        payment_form=payment_form,
        payment_method=payment_method,
        subtotal=subtotal,
        total=total,
        total_taxes=iva_amount,
        company_id=company.id,
        client_id=sale.client_id,
        sale_id=sale_id,
        concepts=concepts,
        taxes=taxes
    )

    invoice = create_invoice(db, invoice_data)

    # Actualizar la venta con el ID de la factura
    sale.invoice_id = invoice.id
    db.commit()

    return invoice