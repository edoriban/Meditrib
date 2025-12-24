from backend.core.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, date


# Tenant model MUST be defined first since other models reference it
class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=True)
    subscription_status = Column(String, default="trial")  # trial, active, expired, cancelled
    subscription_ends_at = Column(DateTime, nullable=True)
    grace_period_ends_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


product_tag_association = Table(
    "product_tag_association",
    Base.metadata,
    Column("product_id", Integer, ForeignKey("products.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("product_tags.id"), primary_key=True)
)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Sin UNIQUE - el barcode es el identificador único
    description = Column(String)
    purchase_price = Column(Float)
    sale_price = Column(Float)
    expiration_date = Column(Date, nullable=True)
    batch_number = Column(String, nullable=True)
    barcode = Column(String, nullable=True, unique=True)
    # Pharmacy-specific fields (optional for other verticals)
    laboratory = Column(String, nullable=True)
    concentration = Column(String, nullable=True)
    prescription_required = Column(Boolean, default=False)
    active_substance = Column(String, nullable=True)
    # Tax and SAT fields
    iva_rate = Column(Float, default=0.0)  # 0.0 = exento, 0.16 = 16%
    sat_key = Column(String, nullable=True)  # Clave SAT para facturación electrónica

    inventory = relationship("Inventory", uselist=False, back_populates="product", cascade="all, delete")
    suppliers = relationship("SupplierProduct", back_populates="product", cascade="all, delete")
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="product", cascade="all, delete")
    tags = relationship("ProductTag", secondary=product_tag_association, backref="products")

class ProductTag(Base):
    __tablename__ = "product_tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    color = Column(String, nullable=True)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    name = Column(String)
    contact_info = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    products = relationship("SupplierProduct", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


class SupplierProduct(Base):
    __tablename__ = "supplier_product"
    supplier_id = Column(ForeignKey("suppliers.id"), primary_key=True)
    product_id = Column(ForeignKey("products.id"), primary_key=True)
    supply_price = Column(Float)
    supplier = relationship("Supplier", back_populates="products")
    product = relationship("Product", back_populates="suppliers")


class Inventory(Base):
    __tablename__ = "inventory"
    product_id = Column(ForeignKey("products.id"), primary_key=True)
    quantity = Column(Integer)
    product = relationship("Product", back_populates="inventory")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role_id = Column(ForeignKey("roles.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    is_owner = Column(Boolean, default=False)
    role = relationship("Role", back_populates="users")
    tenant = relationship("Tenant", backref="users")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    users = relationship("User", back_populates="role")


class Sale(Base):
    """Venta/Pedido principal - puede contener múltiples productos"""
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    sale_date = Column(DateTime, default=datetime.now)
    shipping_date = Column(Date, nullable=True)
    shipping_status = Column(String, default="pending")
    payment_status = Column(String, default="pending")
    payment_method = Column(String, nullable=True)
    document_type = Column(String, default="invoice")
    iva_rate = Column(Float, default=0.16)
    subtotal = Column(Float, default=0.0)
    iva_amount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    notes = Column(String, nullable=True)
    
    user_id = Column(ForeignKey("users.id"))
    user = relationship("User")
    client_id = Column(ForeignKey("clients.id"))
    client = relationship("Client", back_populates="sales")
    
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    """Items individuales de una venta - cada producto con su cantidad"""
    __tablename__ = "sale_items"
    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(ForeignKey("sales.id"), nullable=False)
    product_id = Column(ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    iva_rate = Column(Float, default=0.0)
    subtotal = Column(Float, nullable=False)
    iva_amount = Column(Float, default=0.0)
    
    sale = relationship("Sale", back_populates="items")
    product = relationship("Product")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    name = Column(String)
    contact = Column(String)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)
    rfc = Column(String, nullable=True)
    tax_regime = Column(String, nullable=True)
    cfdi_use = Column(String, nullable=True)
    fiscal_street = Column(String, nullable=True)
    fiscal_exterior_number = Column(String, nullable=True)
    fiscal_interior_number = Column(String, nullable=True)
    fiscal_neighborhood = Column(String, nullable=True)
    fiscal_city = Column(String, nullable=True)
    fiscal_state = Column(String, nullable=True)
    fiscal_postal_code = Column(String, nullable=True)
    fiscal_country = Column(String, default="México")
    sales = relationship("Sale", back_populates="client")
    invoices = relationship("Invoice", back_populates="client")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    report_type = Column(String)
    date = Column(DateTime)
    data = Column(String)
    generated_by = Column(ForeignKey("users.id"))
    user = relationship("User")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(ForeignKey("suppliers.id"))
    order_date = Column(DateTime)
    expected_delivery_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending")
    total_amount = Column(Float, nullable=True)
    created_by = Column(ForeignKey("users.id"))

    created_by_user = relationship("User", foreign_keys=[created_by])
    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    purchase_order_id = Column(ForeignKey("purchase_orders.id"), primary_key=True)
    product_id = Column(ForeignKey("products.id"), primary_key=True)
    quantity = Column(Integer)
    unit_price = Column(Float)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")


class ProductBatch(Base):
    """Lotes de productos con fechas de caducidad"""
    __tablename__ = "product_batches"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    product_id = Column(ForeignKey("products.id"))
    batch_number = Column(String, nullable=False)
    expiration_date = Column(Date, nullable=False)
    quantity_received = Column(Integer, default=0)
    quantity_remaining = Column(Integer, default=0)
    unit_cost = Column(Float)
    supplier_id = Column(ForeignKey("suppliers.id"))
    received_date = Column(DateTime, default=datetime.now)
    notes = Column(String, nullable=True)

    product = relationship("Product", backref="batches")
    supplier = relationship("Supplier")
    stock_movements = relationship("BatchStockMovement", back_populates="batch")


class BatchStockMovement(Base):
    """Movimientos de stock por lote"""
    __tablename__ = "batch_stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(ForeignKey("product_batches.id"))
    movement_type = Column(String)
    quantity = Column(Integer)
    previous_quantity = Column(Integer)
    new_quantity = Column(Integer)
    reason = Column(String, nullable=True)
    reference_id = Column(String, nullable=True)
    movement_date = Column(DateTime, default=datetime.now)
    user_id = Column(ForeignKey("users.id"))

    batch = relationship("ProductBatch", back_populates="stock_movements")
    user = relationship("User")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    type = Column(String)
    message = Column(String)
    product_id = Column(ForeignKey("products.id"))
    severity = Column(String, default="medium")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    resolved_at = Column(DateTime, nullable=True)

    product = relationship("Product")


class Company(Base):
    """Empresa emisora de facturas"""
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    rfc = Column(String, index=True)
    name = Column(String)
    business_name = Column(String, nullable=True)
    tax_regime = Column(String)
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
    logo = Column(String, nullable=True)

    invoices = relationship("Invoice", back_populates="company")


class Invoice(Base):
    """Factura CFDI"""
    __tablename__ = "invoices"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    uuid = Column(String, unique=True, nullable=True)
    serie = Column(String, default="A")
    folio = Column(String, nullable=True)
    invoice_type = Column(String, default="I")
    payment_form = Column(String)
    payment_method = Column(String)
    currency = Column(String, default="MXN")
    exchange_rate = Column(Float, default=1.0)
    subtotal = Column(Float)
    discount = Column(Float, default=0.0)
    total = Column(Float)
    total_taxes = Column(Float, default=0.0)

    issue_date = Column(DateTime, default=datetime.now)
    certification_date = Column(DateTime, nullable=True)

    company_id = Column(ForeignKey("companies.id"))
    client_id = Column(ForeignKey("clients.id"))
    sale_id = Column(ForeignKey("sales.id"))

    status = Column(String, default="draft")
    cfdi_xml = Column(String, nullable=True)
    cancellation_reason = Column(String, nullable=True)

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
    unit = Column(String)
    description = Column(String)
    unit_price = Column(Float)
    amount = Column(Float)
    discount = Column(Float, default=0.0)

    product_id = Column(ForeignKey("products.id"), nullable=True)

    invoice = relationship("Invoice", back_populates="concepts")
    product = relationship("Product")


class InvoiceTax(Base):
    """Impuestos de la factura"""
    __tablename__ = "invoice_taxes"
    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(ForeignKey("invoices.id"))
    tax_type = Column(String)
    tax_rate = Column(Float)
    tax_amount = Column(Float)
    tax_base = Column(Float)

    invoice = relationship("Invoice", back_populates="taxes")


class ExpenseCategory(Base):
    """Categorías de gastos"""
    __tablename__ = "expense_categories"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    name = Column(String)
    description = Column(String, nullable=True)
    type = Column(String, default="variable")
    color = Column(String, nullable=True)

    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    """Registro de gastos"""
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    description = Column(String)
    amount = Column(Float)
    expense_date = Column(DateTime, default=datetime.now)
    category_id = Column(ForeignKey("expense_categories.id"))
    payment_method = Column(String, nullable=True)
    supplier = Column(String, nullable=True)
    invoice_number = Column(String, nullable=True)
    is_tax_deductible = Column(Boolean, default=True)
    tax_amount = Column(Float, default=0.0)
    notes = Column(String, nullable=True)
    created_by = Column(ForeignKey("users.id"))

    category = relationship("ExpenseCategory", back_populates="expenses")
    user = relationship("User")


class AppSettings(Base):
    """Configuración de la aplicación por tenant"""
    __tablename__ = "app_settings"
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    key = Column(String, index=True)
    value = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)