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
    name = Column(String, index=True)  # Sin UNIQUE - el barcode es el identificador único
    description = Column(String)
    purchase_price = Column(Float)
    sale_price = Column(Float)
    expiration_date = Column(Date, nullable=True)
    batch_number = Column(String, nullable=True)
    barcode = Column(String, nullable=True, unique=True)
    laboratory = Column(String, nullable=True)
    concentration = Column(String, nullable=True)
    prescription_required = Column(Boolean, default=False)
    iva_rate = Column(Float, default=0.0)  # 0.0 = exento (medicamentos), 0.16 = 16% (material de curación)
    sat_key = Column(String, nullable=True)  # Clave SAT para facturación electrónica
    image_path = Column(String, nullable=True)  # Ruta de la imagen del medicamento
    active_substance = Column(String, nullable=True)  # Sustancia activa del medicamento
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
    contact_info = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
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
    """Venta/Pedido principal - puede contener múltiples medicamentos"""
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(DateTime, default=datetime.now)
    shipping_date = Column(Date, nullable=True)
    shipping_status = Column(String, default="pending")  # e.g., "pending", "shipped", "delivered", "canceled"
    payment_status = Column(String, default="pending")  # e.g., "pending", "paid", "partial", "refunded"
    payment_method = Column(String, nullable=True)  # e.g., "credit_card", "cash", "transfer"
    document_type = Column(String, default="invoice")  # "invoice" (IVA) or "remission" (nota de remisión)
    iva_rate = Column(Float, default=0.16)  # Tasa de IVA (0.16 = 16%, 0.0 = exento)
    subtotal = Column(Float, default=0.0)  # Suma de todos los items sin IVA
    iva_amount = Column(Float, default=0.0)  # Monto de IVA calculado
    total = Column(Float, default=0.0)  # Total con IVA incluido
    notes = Column(String, nullable=True)  # Notas del pedido
    
    user_id = Column(ForeignKey("users.id"))
    user = relationship("User")
    client_id = Column(ForeignKey("clients.id"))
    client = relationship("Client", back_populates="sales")
    
    # Relación con los items de la venta
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    """Items individuales de una venta - cada medicamento con su cantidad"""
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(ForeignKey("sales.id"), nullable=False)
    medicine_id = Column(ForeignKey("medicines.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Precio unitario al momento de la venta
    discount = Column(Float, default=0.0)  # Descuento por item
    iva_rate = Column(Float, default=0.0)  # Tasa de IVA del producto (0.0, 0.16, etc.)
    subtotal = Column(Float, nullable=False)  # (quantity * unit_price) - discount
    iva_amount = Column(Float, default=0.0)  # IVA calculado para este item
    
    # Relationships
    sale = relationship("Sale", back_populates="items")
    medicine = relationship("Medicine")


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
    # Campos de dirección fiscal para facturación electrónica
    fiscal_street = Column(String, nullable=True)  # Calle fiscal
    fiscal_exterior_number = Column(String, nullable=True)  # Número exterior fiscal
    fiscal_interior_number = Column(String, nullable=True)  # Número interior fiscal
    fiscal_neighborhood = Column(String, nullable=True)  # Colonia fiscal
    fiscal_city = Column(String, nullable=True)  # Ciudad fiscal
    fiscal_state = Column(String, nullable=True)  # Estado fiscal
    fiscal_postal_code = Column(String, nullable=True)  # Código postal fiscal
    fiscal_country = Column(String, default="México")  # País fiscal
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


class MedicineBatch(Base):
    """Lotes de medicamentos con fechas de caducidad"""
    __tablename__ = "medicine_batches"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(ForeignKey("medicines.id"))
    batch_number = Column(String, nullable=False)
    expiration_date = Column(Date, nullable=False)
    quantity_received = Column(Integer, default=0)  # Cantidad recibida en este lote
    quantity_remaining = Column(Integer, default=0)  # Cantidad restante en este lote
    unit_cost = Column(Float)  # Costo unitario de este lote
    supplier_id = Column(ForeignKey("suppliers.id"))
    received_date = Column(DateTime, default=datetime.now)
    notes = Column(String, nullable=True)

    # Relationships
    medicine = relationship("Medicine", backref="batches")
    supplier = relationship("Supplier")

    # Stock movements for this batch
    stock_movements = relationship("BatchStockMovement", back_populates="batch")


class BatchStockMovement(Base):
    """Movimientos de stock por lote"""
    __tablename__ = "batch_stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(ForeignKey("medicine_batches.id"))
    movement_type = Column(String)  # "in", "out", "adjustment"
    quantity = Column(Integer)
    previous_quantity = Column(Integer)
    new_quantity = Column(Integer)
    reason = Column(String, nullable=True)  # "sale", "return", "expiration", "damage", etc.
    reference_id = Column(String, nullable=True)  # Sale ID, Purchase Order ID, etc.
    movement_date = Column(DateTime, default=datetime.now)
    user_id = Column(ForeignKey("users.id"))

    # Relationships
    batch = relationship("MedicineBatch", back_populates="stock_movements")
    user = relationship("User")


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
    name = Column(String)  # Razón Social
    business_name = Column(String, nullable=True)  # Nombre Comercial
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
    logo = Column(String, nullable=True)  # Base64 del logo

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
    sale_id = Column(ForeignKey("sales.id"))  # Factura generada desde venta - REQUERIDO

    # Estado CFDI
    status = Column(String, default="draft")  # draft, issued, cancelled
    cfdi_xml = Column(String, nullable=True)  # XML del CFDI
    cancellation_reason = Column(String, nullable=True)

    # Relationships
    company = relationship("Company", back_populates="invoices")
    client = relationship("Client", back_populates="invoices")
    sale = relationship("Sale", foreign_keys=[sale_id], backref="invoice", uselist=False)
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


class ExpenseCategory(Base):
    """Categorías de gastos"""
    __tablename__ = "expense_categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String, nullable=True)
    type = Column(String, default="variable")  # "fixed" o "variable"
    color = Column(String, nullable=True)  # Para UI

    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    """Registro de gastos"""
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    expense_date = Column(DateTime, default=datetime.now)
    category_id = Column(ForeignKey("expense_categories.id"))
    payment_method = Column(String, nullable=True)  # "cash", "card", "transfer", "check"
    supplier = Column(String, nullable=True)  # Proveedor del gasto
    invoice_number = Column(String, nullable=True)  # Número de factura/comprobante
    is_tax_deductible = Column(Boolean, default=True)  # Deducible para impuestos
    tax_amount = Column(Float, default=0.0)  # IVA del gasto
    notes = Column(String, nullable=True)
    created_by = Column(ForeignKey("users.id"))

    # Relationships
    category = relationship("ExpenseCategory", back_populates="expenses")
    user = relationship("User")