from backend.core.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, date


medicine_tag_association = Table(
    "medicine_tag_association",
    Base.metadata,
    Column("medicine_id", Integer, ForeignKey("medicines.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("medicine_tags.id"), primary_key=True)
)

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    purchase_price = Column(Float)
    sale_price = Column(Float)
    expiration_date = Column(Date, nullable=True)
    batch_number = Column(String, nullable=True)
    barcode = Column(String, nullable=True, unique=True)
    laboratory = Column(String, nullable=True)
    concentration = Column(String, nullable=True)
    prescription_required = Column(Boolean, default=False)
    inventory = relationship("Inventory", uselist=False, back_populates="medicine", cascade="all, delete")
    suppliers = relationship("SupplierMedicine", back_populates="medicine", cascade="all, delete")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="medicine", cascade="all, delete")
    tags = relationship("MedicineTag", secondary=medicine_tag_association, backref="medicines")

class MedicineTag(Base):
    __tablename__ = "medicine_tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    color = Column(String, nullable=True)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    medicines = relationship("SupplierMedicine", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class SupplierMedicine(Base):
    __tablename__ = "supplier_medicine"
    supplier_id = Column(ForeignKey("suppliers.id"), primary_key=True)
    medicine_id = Column(ForeignKey("medicines.id"), primary_key=True)
    supply_price = Column(Float)
    supplier = relationship("Supplier", back_populates="medicines")
    medicine = relationship("Medicine", back_populates="suppliers")


class Inventory(Base):
    __tablename__ = "inventory"
    medicine_id = Column(ForeignKey("medicines.id"), primary_key=True)
    quantity = Column(Integer)
    medicine = relationship("Medicine", back_populates="inventory")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role_id = Column(ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    users = relationship("User", back_populates="role")


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(ForeignKey("medicines.id"))
    quantity = Column(Integer)
    total_price = Column(Float)
    sale_date = Column(DateTime, default=datetime.now)
    shipping_date = Column(Date, nullable=True)
    shipping_status = Column(String, default="pending")  # e.g., "pending", "completed", "canceled"
    payment_status = Column(String, default="pending")  # e.g., "pending", "paid", "refunded"
    payment_method = Column(String, nullable=True)  # e.g., "credit_card", "cash", "insurance"
    document_type = Column(String, default="invoice")  # "invoice" (IVA) or "remission" (nota de remisión)
    iva_rate = Column(Float, default=0.16)  # Tasa de IVA (0.16 = 16%, 0.0 = exento)
    iva_amount = Column(Float, default=0.0)  # Monto de IVA calculado
    subtotal = Column(Float)  # Subtotal sin IVA
    total_with_iva = Column(Float)  # Total con IVA incluido
    user_id = Column(ForeignKey("users.id"))
    user = relationship("User")
    medicine = relationship("Medicine")
    client_id = Column(ForeignKey("clients.id"))
    client = relationship("Client", back_populates="sales")
    invoice_id = Column(ForeignKey("invoices.id"), nullable=True)  # Factura generada
    invoice = relationship("Invoice")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rfc = Column(String, nullable=True)  # RFC del cliente para facturación
    tax_regime = Column(String, nullable=True)  # Régimen fiscal del cliente
    cfdi_use = Column(String, nullable=True)  # Uso del CFDI
    sales = relationship("Sale", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String)  # e.g., "sales", "inventory"
    date = Column(DateTime)  # Date of the report
    data = Column(String)  # JSON or CSV data of the report
    generated_by = Column(ForeignKey("users.id"))
    user = relationship("User")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(ForeignKey("suppliers.id"))
    order_date = Column(DateTime)
    expected_delivery_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending")  # e.g., "pending", "shipped", "received", "canceled"
    total_amount = Column(Float, nullable=True)
    created_by = Column(ForeignKey("users.id"))

    created_by_user = relationship("User", foreign_keys=[created_by])
    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    purchase_order_id = Column(ForeignKey("purchase_orders.id"), primary_key=True)
    medicine_id = Column(ForeignKey("medicines.id"), primary_key=True)
    quantity = Column(Integer)
    unit_price = Column(Float)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    medicine = relationship("Medicine")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)  # 'low_stock', 'expiring', 'expired', 'critical_stock'
    message = Column(String)
    medicine_id = Column(ForeignKey("medicines.id"))
    severity = Column(String, default="medium")  # 'low', 'medium', 'high', 'critical'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    resolved_at = Column(DateTime, nullable=True)

    medicine = relationship("Medicine")


class Company(Base):
    """Empresa emisora de facturas"""
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    rfc = Column(String, unique=True, index=True)
    name = Column(String)
    tax_regime = Column(String)  # Régimen fiscal
    street = Column(String)
    exterior_number = Column(String)
    interior_number = Column(String, nullable=True)
    neighborhood = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String, default="México")
    postal_code = Column(String)
    email = Column(String)
    phone = Column(String, nullable=True)

    invoices = relationship("Invoice", back_populates="company")


class Invoice(Base):
    """Factura CFDI"""
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, nullable=True)  # Folio fiscal
    serie = Column(String, default="A")  # Serie de facturación
    folio = Column(String, nullable=True)  # Número de folio
    invoice_type = Column(String, default="I")  # I=Ingreso, E=Egreso, etc.
    payment_form = Column(String)  # Forma de pago
    payment_method = Column(String)  # Método de pago
    currency = Column(String, default="MXN")
    exchange_rate = Column(Float, default=1.0)
    subtotal = Column(Float)
    discount = Column(Float, default=0.0)
    total = Column(Float)
    total_taxes = Column(Float, default=0.0)

    # Fechas
    issue_date = Column(DateTime, default=datetime.now)
    certification_date = Column(DateTime, nullable=True)

    # Relaciones
    company_id = Column(ForeignKey("companies.id"))
    client_id = Column(ForeignKey("clients.id"))
    sale_id = Column(ForeignKey("sales.id"), nullable=True)  # Factura generada desde venta

    # Estado CFDI
    status = Column(String, default="draft")  # draft, issued, cancelled
    cfdi_xml = Column(String, nullable=True)  # XML del CFDI
    cancellation_reason = Column(String, nullable=True)

    # Relationships
    company = relationship("Company", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    sale = relationship("Sale")
    concepts = relationship("InvoiceConcept", back_populates="invoice", cascade="all, delete")
    taxes = relationship("InvoiceTax", back_populates="invoice", cascade="all, delete")


class InvoiceConcept(Base):
    """Conceptos de la factura (productos/servicios)"""
    __tablename__ = "invoice_concepts"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(ForeignKey("invoices.id"))
    quantity = Column(Float)
    unit = Column(String)  # Unidad de medida
    description = Column(String)
    unit_price = Column(Float)
    amount = Column(Float)  # quantity * unit_price
    discount = Column(Float, default=0.0)

    # Producto relacionado (opcional)
    medicine_id = Column(ForeignKey("medicines.id"), nullable=True)

    # Relationships
    invoice = relationship("Invoice", back_populates="concepts")
    medicine = relationship("Medicine")


class InvoiceTax(Base):
    """Impuestos de la factura"""
    __tablename__ = "invoice_taxes"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(ForeignKey("invoices.id"))
    tax_type = Column(String)  # IVA, ISR, IEPS
    tax_rate = Column(Float)  # Tasa del impuesto
    tax_amount = Column(Float)  # Monto del impuesto
    tax_base = Column(Float)  # Base gravable

    invoice = relationship("Invoice", back_populates="taxes")