import xml.etree.ElementTree as ET
from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Session, selectinload

from backend.core.models import Company, Invoice, InvoiceConcept, InvoiceTax, Sale, SaleItem
from backend.core.schemas import (
    CompanyCreate,
    CompanyUpdate,
    InvoiceConceptCreate,
    InvoiceCreate,
    InvoiceTaxCreate,
    InvoiceUpdate,
)


def get_invoices(db: Session, skip: int = 0, limit: int = 100) -> list[Invoice]:
    return db.query(Invoice).offset(skip).limit(limit).all()


def get_invoice(db: Session, invoice_id: int) -> Invoice | None:
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

    db_invoice = Invoice(**invoice.model_dump(exclude={"concepts", "taxes"}), folio=folio)

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


def update_invoice(db: Session, invoice_id: int, invoice_update: InvoiceUpdate) -> Invoice | None:
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


def generate_cfdi_xml(db: Session, invoice_id: int) -> str | None:
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
    update_invoice(db, invoice_id, InvoiceUpdate(status="issued", cfdi_xml=xml_str, certification_date=datetime.now()))

    return xml_str


def create_company(db: Session, company: CompanyCreate) -> Company:
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


def get_company(db: Session, company_id: int) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


def get_companies(db: Session) -> list[Company]:
    return db.query(Company).all()


def update_company(db: Session, company_id: int, company_update: CompanyUpdate) -> Company | None:
    """Actualizar datos de una empresa"""
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if db_company:
        update_data = company_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_company, key, value)
        db.commit()
        db.refresh(db_company)
    return db_company


def delete_company(db: Session, company_id: int) -> bool:
    """Eliminar una empresa"""
    db_company = db.query(Company).filter(Company.id == company_id).first()
    if db_company:
        db.delete(db_company)
        db.commit()
        return True
    return False


def create_invoice_from_sale(db: Session, sale_id: int, payment_form: str = "01", payment_method: str = "PUE") -> dict:
    """Crear factura automáticamente desde una venta

    Retorna:
        - Invoice si se crea exitosamente
        - dict con error si hay problemas
    """
    sale = (
        db.query(Sale)
        .options(selectinload(Sale.items).selectinload(SaleItem.medicine))
        .filter(Sale.id == sale_id)
        .first()
    )
    if not sale:
        return {"error": "sale_not_found", "message": "La venta no existe"}

    # Verificar si la venta ya tiene una factura
    existing_invoice = db.query(Invoice).filter(Invoice.sale_id == sale_id).first()
    if existing_invoice:
        return {"error": "already_invoiced", "message": "Esta venta ya tiene una factura asociada"}

    # Obtener la primera empresa (por ahora asumimos una sola)
    company = db.query(Company).first()
    if not company:
        return {
            "error": "no_company",
            "message": "No hay empresa configurada. Por favor configure los datos de la empresa emisora primero.",
        }

    # Calcular subtotal, IVA y total basado en cada item de la venta
    subtotal_sin_iva = Decimal("0")
    total_iva = Decimal("0")

    # Agrupar por tasa de IVA para los impuestos
    iva_by_rate = {}  # {rate: {"base": amount, "iva": amount}}

    # Crear conceptos desde los items de la venta
    concepts = []
    for item in sale.items:
        item_subtotal = Decimal(str(item.subtotal))
        item_iva_rate = Decimal(str(item.iva_rate)) if item.iva_rate else Decimal("0")
        item_iva_amount = Decimal(str(item.iva_amount)) if item.iva_amount else Decimal("0")

        # Calcular base sin IVA para cada concepto
        # El subtotal del item ya está sin IVA
        base_sin_iva = item_subtotal

        subtotal_sin_iva += base_sin_iva
        total_iva += item_iva_amount

        # Agrupar IVA por tasa
        rate_key = float(item_iva_rate)
        if rate_key not in iva_by_rate:
            iva_by_rate[rate_key] = {"base": Decimal("0"), "iva": Decimal("0")}
        iva_by_rate[rate_key]["base"] += base_sin_iva
        iva_by_rate[rate_key]["iva"] += item_iva_amount

        concepts.append(
            InvoiceConceptCreate(
                quantity=item.quantity,
                unit="PIEZA",
                description=f"{item.medicine.name}"
                + (f" - {item.medicine.description}" if item.medicine.description else ""),
                unit_price=float(item.unit_price),
                amount=float(base_sin_iva),
                discount=float(item.discount) if item.discount else 0.0,
                medicine_id=item.medicine_id,
            )
        )

    # Crear impuestos agrupados por tasa
    taxes = []
    for rate, amounts in iva_by_rate.items():
        if rate > 0:  # Solo agregar impuestos con tasa mayor a 0
            taxes.append(
                InvoiceTaxCreate(
                    tax_type="002",  # IVA
                    tax_rate=rate,
                    tax_amount=float(amounts["iva"]),
                    tax_base=float(amounts["base"]),
                )
            )

    total = subtotal_sin_iva + total_iva

    invoice_data = InvoiceCreate(
        payment_form=payment_form,
        payment_method=payment_method,
        subtotal=float(subtotal_sin_iva),
        total=float(total),
        total_taxes=float(total_iva),
        company_id=company.id,
        client_id=sale.client_id,
        sale_id=sale_id,
        concepts=concepts,
        taxes=taxes,
    )

    invoice = create_invoice(db, invoice_data)

    return invoice
