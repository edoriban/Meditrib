from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

# Inventory Schemas


class InventoryBase(BaseModel):
    quantity: int


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    pass


class Inventory(InventoryBase):
    product_id: int

    class Config:
        from_attributes = True


# Tag Schemas


class ProductTagBase(BaseModel):
    name: str
    description: str | None = None
    color: str | None = None


class ProductTagCreate(ProductTagBase):
    pass


class ProductTagUpdate(ProductTagBase):
    name: str | None = None


class ProductTag(ProductTagBase):
    id: int

    class Config:
        from_attributes = True


# Product Schemas


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    sale_price: float
    purchase_price: float | None = None
    expiration_date: date | None = None
    batch_number: str | None = None
    barcode: str | None = None
    # Pharmacy-specific fields (optional for other verticals)
    laboratory: str | None = None
    concentration: str | None = None
    prescription_required: bool = False
    active_substance: str | None = None
    # Tax and SAT fields
    iva_rate: float = 0.0  # 0.0 = exento, 0.16 = 16%
    sat_key: str | None = None  # Clave SAT para facturación electrónica


class ProductCreate(ProductBase):
    tags: list[int] | None = []
    inventory: InventoryCreate | None = None


class ProductUpdate(ProductBase):
    tags: list[int] | None = []
    inventory: InventoryUpdate | None = None


class Product(ProductBase):
    id: int
    tags: list[ProductTag] = []
    inventory: Inventory | None = None

    class Config:
        from_attributes = True


class ProductPaginatedResponse(BaseModel):
    """Schema para respuesta paginada de productos"""

    items: list[Product]
    total: int
    page: int
    page_size: int
    total_pages: int

    class Config:
        from_attributes = True


# Supplier Schemas


class SupplierBase(BaseModel):
    name: str
    contact_info: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    name: str | None = None
    contact_info: str | None = None
    email: EmailStr | None = None
    phone: str | None = None


class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(RoleBase):
    name: str | None = None
    description: str | None = None


class Role(RoleBase):
    id: int

    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role_id: int


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    role_id: int | None = None


class User(UserBase):
    id: int
    role: Role

    class Config:
        from_attributes = True


# PurchaseOrder Schemas
class PurchaseOrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass


class PurchaseOrderItemUpdate(BaseModel):
    quantity: int | None = None
    unit_price: float | None = None


class PurchaseOrderItem(PurchaseOrderItemBase):
    purchase_order_id: int
    product: Product

    class Config:
        from_attributes = True


class PurchaseOrderBase(BaseModel):
    supplier_id: int
    order_date: date
    expected_delivery_date: date | None = None
    status: str = "pending"
    total_amount: float | None = None
    items: list[PurchaseOrderItemCreate] = []
    created_by: int


class PurchaseOrderCreate(PurchaseOrderBase):
    pass


class PurchaseOrderUpdate(BaseModel):
    supplier_id: int | None = None
    order_date: date | None = None
    expected_delivery_date: date | None = None
    status: str | None = None
    total_amount: float | None = None
    items: list[PurchaseOrderItemCreate] | None = None
    created_by: int | None = None


class PurchaseOrder(PurchaseOrderBase):
    id: int
    supplier: Supplier
    items: list[PurchaseOrderItem] = []

    class Config:
        from_attributes = True


# Client Schemas
class ClientBase(BaseModel):
    name: str
    contact: str | None = None
    address: str | None = None
    email: EmailStr | None = None
    rfc: str | None = None
    tax_regime: str | None = None
    cfdi_use: str | None = None
    fiscal_street: str | None = None
    fiscal_exterior_number: str | None = None
    fiscal_interior_number: str | None = None
    fiscal_neighborhood: str | None = None
    fiscal_city: str | None = None
    fiscal_state: str | None = None
    fiscal_postal_code: str | None = None
    fiscal_country: str | None = "México"


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: str | None = None
    contact: str | None = None
    address: str | None = None
    email: EmailStr | None = None
    rfc: str | None = None
    tax_regime: str | None = None
    cfdi_use: str | None = None
    fiscal_street: str | None = None
    fiscal_exterior_number: str | None = None
    fiscal_interior_number: str | None = None
    fiscal_neighborhood: str | None = None
    fiscal_city: str | None = None
    fiscal_state: str | None = None
    fiscal_postal_code: str | None = None
    fiscal_country: str | None = None


class Client(ClientBase):
    id: int

    class Config:
        from_attributes = True


# Sale Schemas


class SaleItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemUpdate(BaseModel):
    quantity: int | None = None
    unit_price: float | None = None
    discount: float | None = None


class SaleItem(SaleItemBase):
    id: int
    sale_id: int
    subtotal: float
    iva_rate: float = 0.0
    iva_amount: float = 0.0
    product: Product

    class Config:
        from_attributes = True


class SaleBase(BaseModel):
    client_id: int
    user_id: int
    document_type: str = "invoice"  # "invoice" or "remission"
    iva_rate: float = 0.16
    shipping_date: date | None = None
    shipping_status: str = "pending"
    payment_status: str = "pending"
    payment_method: str | None = None
    notes: str | None = None


class SaleCreate(SaleBase):
    items: list[SaleItemCreate]
    sale_date: datetime | None = None


class SaleUpdate(BaseModel):
    client_id: int | None = None
    user_id: int | None = None
    document_type: str | None = None
    iva_rate: float | None = None
    shipping_date: date | None = None
    shipping_status: str | None = None
    payment_status: str | None = None
    payment_method: str | None = None
    notes: str | None = None
    items: list[SaleItemCreate] | None = None


class Sale(SaleBase):
    id: int
    sale_date: datetime
    subtotal: float
    iva_amount: float
    total: float
    items: list[SaleItem] = []
    client: Client
    user: User

    class Config:
        from_attributes = True


class SaleWithInvoice(Sale):
    """Sale with optional invoice - use only when invoice data is needed"""

    invoice: Optional["Invoice"] = None

    class Config:
        from_attributes = True


# Report Schemas
class ReportBase(BaseModel):
    report_type: str
    date: datetime
    data: str
    generated_by: int


class ReportCreate(ReportBase):
    pass


class ReportUpdate(ReportBase):
    report_type: str | None = None
    date: datetime | None = None
    data: str | None = None
    generated_by: int | None = None


class Report(ReportBase):
    id: int
    user: User

    class Config:
        from_attributes = True


# Alert Schemas
class AlertBase(BaseModel):
    type: str
    message: str
    product_id: int
    severity: str = "medium"
    is_active: bool = True


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    type: str | None = None
    message: str | None = None
    severity: str | None = None
    is_active: bool | None = None
    resolved_at: datetime | None = None


class Alert(AlertBase):
    id: int
    created_at: datetime
    resolved_at: datetime | None = None
    product: Product

    class Config:
        from_attributes = True


# Company Schemas
class CompanyBase(BaseModel):
    rfc: str
    name: str  # Razón Social
    business_name: str | None = None  # Nombre Comercial
    tax_regime: str
    street: str
    exterior_number: str
    interior_number: str | None = None
    neighborhood: str
    city: str
    state: str
    country: str = "México"
    postal_code: str
    email: str
    phone: str | None = None
    logo: str | None = None  # Base64 del logo


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(BaseModel):
    rfc: str | None = None
    name: str | None = None
    business_name: str | None = None
    tax_regime: str | None = None
    street: str | None = None
    exterior_number: str | None = None
    interior_number: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    postal_code: str | None = None
    email: str | None = None
    phone: str | None = None
    logo: str | None = None


class Company(CompanyBase):
    id: int

    class Config:
        from_attributes = True


# Invoice Schemas
class InvoiceConceptBase(BaseModel):
    quantity: float
    unit: str
    description: str
    unit_price: float
    amount: float
    discount: float = 0.0
    product_id: int | None = None


class InvoiceConceptCreate(InvoiceConceptBase):
    pass


class InvoiceConcept(InvoiceConceptBase):
    id: int
    invoice_id: int
    product: Product | None = None

    class Config:
        from_attributes = True


class InvoiceTaxBase(BaseModel):
    tax_type: str
    tax_rate: float
    tax_amount: float
    tax_base: float


class InvoiceTaxCreate(InvoiceTaxBase):
    pass


class InvoiceTax(InvoiceTaxBase):
    id: int
    invoice_id: int

    class Config:
        from_attributes = True


# Expense Schemas
class ExpenseCategoryBase(BaseModel):
    name: str
    description: str | None = None
    type: str = "variable"
    color: str | None = None


class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass


class ExpenseCategoryUpdate(ExpenseCategoryBase):
    name: str | None = None


class ExpenseCategory(ExpenseCategoryBase):
    id: int

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    description: str
    amount: float
    expense_date: datetime
    category_id: int
    payment_method: str | None = None
    supplier: str | None = None
    invoice_number: str | None = None
    is_tax_deductible: bool = True
    tax_amount: float = 0.0
    notes: str | None = None
    created_by: int


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    description: str | None = None
    amount: float | None = None
    expense_date: datetime | None = None
    category_id: int | None = None
    payment_method: str | None = None
    supplier: str | None = None
    invoice_number: str | None = None
    is_tax_deductible: bool | None = None
    tax_amount: float | None = None
    notes: str | None = None


class Expense(ExpenseBase):
    id: int
    category: ExpenseCategory
    user: User

    class Config:
        from_attributes = True


# Batch Management Schemas
class ProductBatchBase(BaseModel):
    product_id: int
    batch_number: str
    expiration_date: date
    quantity_received: int = 0
    quantity_remaining: int = 0
    unit_cost: float | None = None
    supplier_id: int | None = None
    received_date: datetime
    notes: str | None = None


class ProductBatchCreate(ProductBatchBase):
    pass


class ProductBatchUpdate(BaseModel):
    batch_number: str | None = None
    expiration_date: date | None = None
    quantity_received: int | None = None
    quantity_remaining: int | None = None
    unit_cost: float | None = None
    supplier_id: int | None = None
    notes: str | None = None


class ProductBatch(ProductBatchBase):
    id: int
    product: Product
    supplier: Supplier | None = None

    class Config:
        from_attributes = True


class BatchStockMovementBase(BaseModel):
    batch_id: int
    movement_type: str
    quantity: int
    previous_quantity: int
    new_quantity: int
    reason: str | None = None
    reference_id: str | None = None
    movement_date: datetime
    user_id: int


class BatchStockMovementCreate(BatchStockMovementBase):
    pass


class BatchStockMovementUpdate(BaseModel):
    movement_type: str | None = None
    quantity: int | None = None
    previous_quantity: int | None = None
    new_quantity: int | None = None
    reason: str | None = None
    reference_id: str | None = None


class BatchStockMovement(BatchStockMovementBase):
    id: int
    batch: ProductBatch
    user: User

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    serie: str = "A"
    folio: str | None = None
    invoice_type: str = "I"
    payment_form: str
    payment_method: str
    currency: str = "MXN"
    exchange_rate: float = 1.0
    subtotal: float
    discount: float = 0.0
    total: float
    total_taxes: float = 0.0
    company_id: int
    client_id: int
    sale_id: int  # REQUERIDO - Factura debe estar asociada a una venta
    concepts: list[InvoiceConceptCreate] = []
    taxes: list[InvoiceTaxCreate] = []


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceUpdate(BaseModel):
    status: str | None = None
    cfdi_xml: str | None = None
    cancellation_reason: str | None = None


class Invoice(InvoiceBase):
    id: int
    uuid: str | None = None
    issue_date: datetime
    certification_date: datetime | None = None
    status: str
    company: Company
    client: Client
    sale: Sale | None = None
    concepts: list[InvoiceConcept] = []
    taxes: list[InvoiceTax] = []

    class Config:
        from_attributes = True


# Token Schemas


class Token(BaseModel):
    access_token: str
    token_type: str


# Excel Import Schemas
class ExcelImportItem(BaseModel):
    """Item de importación desde Excel con información de precios y cambios"""

    barcode: str
    name: str
    active_substance: str | None = None
    laboratory: str | None = None
    purchase_price_new: float
    purchase_price_old: float | None = None
    sale_price_suggested: float
    sale_price_current: float | None = None
    price_change: str  # "up", "down", "new", "same"
    iva_rate: float
    inventory_to_add: int
    exists: bool
    product_id: int | None = None
    price_range: str
    price_difference: dict | None = None


class ExcelImportPreviewResponse(BaseModel):
    """Respuesta de previsualización de importación Excel"""

    items: list[ExcelImportItem]
    total_items: int
    new_products: int
    existing_products: int
    price_changes: int


class ExcelImportConfirmItem(BaseModel):
    """Item de confirmación para importación Excel"""

    barcode: str
    name: str
    active_substance: str | None = None
    laboratory: str | None = None
    purchase_price: float
    sale_price: float  # Precio editado por el usuario
    iva_rate: float
    inventory_to_add: int
    exists: bool
    product_id: int | None = None
    sat_key: str | None = None


class ExcelImportResult(BaseModel):
    """Resultado de importación Excel"""

    created: int
    updated: int
    errors: list[dict]
    total_processed: int


# Rebuild models for forward references
Sale.model_rebuild()
SaleWithInvoice.model_rebuild()
Invoice.model_rebuild()
