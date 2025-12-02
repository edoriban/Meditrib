from typing import Optional, List
from pydantic import BaseModel, EmailStr
from datetime import datetime, date

# Inventory Schemas

class InventoryBase(BaseModel):
    quantity: int

class InventoryCreate(InventoryBase):
    pass

class InventoryUpdate(InventoryBase):
    pass

class Inventory(InventoryBase):
    medicine_id: int
    
    class Config:
        from_attributes = True

# Tag Schemas

class MedicineTagBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = None


class MedicineTagCreate(MedicineTagBase):
    pass


class MedicineTagUpdate(MedicineTagBase):
    name: str | None = None


class MedicineTag(MedicineTagBase):
    id: int
    
    class Config:
        from_attributes = True

# Medicine Schemas


class MedicineBase(BaseModel):
    name: str
    description: Optional[str] = None
    sale_price: float
    purchase_price: Optional[float] = None
    expiration_date: Optional[date] = None
    batch_number: Optional[str] = None
    barcode: Optional[str] = None
    laboratory: Optional[str] = None
    concentration: Optional[str] = None
    prescription_required: bool = False
    iva_rate: float = 0.0  # 0.0 = exento (medicamentos), 0.16 = 16% (material de curación)
    sat_key: Optional[str] = None  # Clave SAT para facturación electrónica
    image_path: Optional[str] = None  # Ruta de la imagen del medicamento
    active_substance: Optional[str] = None  # Sustancia activa del medicamento


class MedicineCreate(MedicineBase):
    tags: Optional[List[int]] = []
    inventory: Optional[InventoryCreate] = None


class MedicineUpdate(MedicineBase):
    tags: Optional[List[int]] = []
    inventory: Optional[InventoryUpdate] = None


class Medicine(MedicineBase):
    id: int
    tags: List[MedicineTag] = []
    inventory: Optional[Inventory] = None

    class Config:
        from_attributes = True

# Otros esquemas existentes...

class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None  # Cambiado de 'contact' para coincidir con el schema
    email: Optional[EmailStr] = None  # Usar EmailStr para validación
    phone: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    name: Optional[str] = None
    contact_info: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass

class RoleUpdate(RoleBase):
    name: Optional[str] = None
    description: Optional[str] = None

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
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role_id: Optional[int] = None

class User(UserBase):
    id: int
    role: Role

    class Config:
        from_attributes = True

# PurchaseOrder Schemas
class PurchaseOrderItemBase(BaseModel):
    medicine_id: int
    quantity: int
    unit_price: float

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None

class PurchaseOrderItem(PurchaseOrderItemBase):
    purchase_order_id: int
    medicine: Medicine

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    supplier_id: int
    order_date: date
    expected_delivery_date: Optional[date] = None
    status: str = "pending"
    total_amount: Optional[float] = None
    items: List[PurchaseOrderItemCreate] = []
    created_by: int

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderUpdate(BaseModel):
    supplier_id: Optional[int] = None
    order_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    status: Optional[str] = None
    total_amount: Optional[float] = None
    items: Optional[List[PurchaseOrderItemCreate]] = None
    created_by: Optional[int] = None

class PurchaseOrder(PurchaseOrderBase):
    id: int
    supplier: Supplier
    items: List[PurchaseOrderItem] = []

    class Config:
        from_attributes = True

# Client Schemas
class ClientBase(BaseModel):
    name: str
    contact: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    rfc: Optional[str] = None
    tax_regime: Optional[str] = None
    cfdi_use: Optional[str] = None
    fiscal_street: Optional[str] = None
    fiscal_exterior_number: Optional[str] = None
    fiscal_interior_number: Optional[str] = None
    fiscal_neighborhood: Optional[str] = None
    fiscal_city: Optional[str] = None
    fiscal_state: Optional[str] = None
    fiscal_postal_code: Optional[str] = None
    fiscal_country: Optional[str] = "México"

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None
    rfc: Optional[str] = None
    tax_regime: Optional[str] = None
    cfdi_use: Optional[str] = None
    fiscal_street: Optional[str] = None
    fiscal_exterior_number: Optional[str] = None
    fiscal_interior_number: Optional[str] = None
    fiscal_neighborhood: Optional[str] = None
    fiscal_city: Optional[str] = None
    fiscal_state: Optional[str] = None
    fiscal_postal_code: Optional[str] = None
    fiscal_country: Optional[str] = None

class Client(ClientBase):
    id: int

    class Config:
        from_attributes = True

# Sale Schemas

class SaleItemBase(BaseModel):
    medicine_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0

class SaleItemCreate(SaleItemBase):
    pass

class SaleItemUpdate(BaseModel):
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    discount: Optional[float] = None

class SaleItem(SaleItemBase):
    id: int
    sale_id: int
    subtotal: float
    iva_rate: float = 0.0
    iva_amount: float = 0.0
    medicine: Medicine

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    client_id: int
    user_id: int
    document_type: str = "invoice"  # "invoice" or "remission"
    iva_rate: float = 0.16
    shipping_date: Optional[date] = None
    shipping_status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    sale_date: Optional[datetime] = None

class SaleUpdate(BaseModel):
    client_id: Optional[int] = None
    user_id: Optional[int] = None
    document_type: Optional[str] = None
    iva_rate: Optional[float] = None
    shipping_date: Optional[date] = None
    shipping_status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None
    items: Optional[List[SaleItemCreate]] = None

class Sale(SaleBase):
    id: int
    sale_date: datetime
    subtotal: float
    iva_amount: float
    total: float
    items: List[SaleItem] = []
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
    date: datetime  # Considerar usar date o datetime de Pydantic/Python
    data: str  # Considerar usar dict o list si el formato es JSON
    generated_by: int

class ReportCreate(ReportBase):
    pass

class ReportUpdate(ReportBase):
    report_type: Optional[str] = None
    date: Optional[datetime] = None
    data: Optional[str] = None
    generated_by: Optional[int] = None

class Report(ReportBase):
    id: int
    user: User  # Incluir el usuario que generó el reporte

    class Config:
        from_attributes = True

# Alert Schemas
class AlertBase(BaseModel):
    type: str
    message: str
    medicine_id: int
    severity: str = "medium"
    is_active: bool = True

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    type: Optional[str] = None
    message: Optional[str] = None
    severity: Optional[str] = None
    is_active: Optional[bool] = None
    resolved_at: Optional[datetime] = None

class Alert(AlertBase):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    medicine: Medicine

    class Config:
        from_attributes = True

# Company Schemas
class CompanyBase(BaseModel):
    rfc: str
    name: str
    tax_regime: str
    street: str
    exterior_number: str
    interior_number: Optional[str] = None
    neighborhood: str
    city: str
    state: str
    country: str = "México"
    postal_code: str
    email: str
    phone: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    rfc: Optional[str] = None
    name: Optional[str] = None
    tax_regime: Optional[str] = None
    street: Optional[str] = None
    exterior_number: Optional[str] = None

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
    medicine_id: Optional[int] = None

class InvoiceConceptCreate(InvoiceConceptBase):
    pass

class InvoiceConcept(InvoiceConceptBase):
    id: int
    invoice_id: int
    medicine: Optional[Medicine] = None

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
    description: Optional[str] = None
    type: str = "variable"
    color: Optional[str] = None

class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass

class ExpenseCategoryUpdate(ExpenseCategoryBase):
    name: Optional[str] = None

class ExpenseCategory(ExpenseCategoryBase):
    id: int

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    description: str
    amount: float
    expense_date: datetime
    category_id: int
    payment_method: Optional[str] = None
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    is_tax_deductible: bool = True
    tax_amount: float = 0.0
    notes: Optional[str] = None
    created_by: int

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[datetime] = None
    category_id: Optional[int] = None
    payment_method: Optional[str] = None
    supplier: Optional[str] = None
    invoice_number: Optional[str] = None
    is_tax_deductible: Optional[bool] = None
    tax_amount: Optional[float] = None
    notes: Optional[str] = None

class Expense(ExpenseBase):
    id: int
    category: ExpenseCategory
    user: User

    class Config:
        from_attributes = True

# Batch Management Schemas
class MedicineBatchBase(BaseModel):
    medicine_id: int
    batch_number: str
    expiration_date: date
    quantity_received: int = 0
    quantity_remaining: int = 0
    unit_cost: Optional[float] = None
    supplier_id: Optional[int] = None
    received_date: datetime
    notes: Optional[str] = None

class MedicineBatchCreate(MedicineBatchBase):
    pass

class MedicineBatchUpdate(BaseModel):
    batch_number: Optional[str] = None
    expiration_date: Optional[date] = None
    quantity_received: Optional[int] = None
    quantity_remaining: Optional[int] = None
    unit_cost: Optional[float] = None
    supplier_id: Optional[int] = None
    notes: Optional[str] = None

class MedicineBatch(MedicineBatchBase):
    id: int
    medicine: Medicine
    supplier: Optional[Supplier] = None

    class Config:
        from_attributes = True

class BatchStockMovementBase(BaseModel):
    batch_id: int
    movement_type: str
    quantity: int
    previous_quantity: int
    new_quantity: int
    reason: Optional[str] = None
    reference_id: Optional[str] = None
    movement_date: datetime
    user_id: int

class BatchStockMovementCreate(BatchStockMovementBase):
    pass

class BatchStockMovementUpdate(BaseModel):
    movement_type: Optional[str] = None
    quantity: Optional[int] = None
    previous_quantity: Optional[int] = None
    new_quantity: Optional[int] = None
    reason: Optional[str] = None
    reference_id: Optional[str] = None

class BatchStockMovement(BatchStockMovementBase):
    id: int
    batch: MedicineBatch
    user: User

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    serie: str = "A"
    folio: Optional[str] = None
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
    concepts: List[InvoiceConceptCreate] = []
    taxes: List[InvoiceTaxCreate] = []

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    cfdi_xml: Optional[str] = None
    cancellation_reason: Optional[str] = None

class Invoice(InvoiceBase):
    id: int
    uuid: Optional[str] = None
    issue_date: datetime
    certification_date: Optional[datetime] = None
    status: str
    company: Company
    client: Client
    sale: Optional[Sale] = None
    concepts: List[InvoiceConcept] = []
    taxes: List[InvoiceTax] = []

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
    active_substance: Optional[str] = None
    laboratory: Optional[str] = None
    purchase_price_new: float
    purchase_price_old: Optional[float] = None
    sale_price_suggested: float
    sale_price_current: Optional[float] = None
    price_change: str  # "up", "down", "new", "same"
    iva_rate: float
    inventory_to_add: int
    exists: bool
    medicine_id: Optional[int] = None
    price_range: str
    price_difference: Optional[dict] = None

class ExcelImportPreviewResponse(BaseModel):
    """Respuesta de previsualización de importación Excel"""
    items: List[ExcelImportItem]
    total_items: int
    new_medicines: int
    existing_medicines: int
    price_changes: int

class ExcelImportConfirmItem(BaseModel):
    """Item de confirmación para importación Excel"""
    barcode: str
    name: str
    active_substance: Optional[str] = None
    laboratory: Optional[str] = None
    purchase_price: float
    sale_price: float  # Precio editado por el usuario
    iva_rate: float
    inventory_to_add: int
    exists: bool
    medicine_id: Optional[int] = None
    sat_key: Optional[str] = None
    image_path: Optional[str] = None

class ExcelImportResult(BaseModel):
    """Resultado de importación Excel"""
    created: int
    updated: int
    errors: List[dict]
    total_processed: int
# Actualizar referencias después de definir todas las clases
Sale.model_rebuild()
SaleWithInvoice.model_rebuild()
Invoice.model_rebuild()
