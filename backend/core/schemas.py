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

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    email: Optional[EmailStr] = None

class Client(ClientBase):
    id: int

    class Config:
        from_attributes = True

# Sale Schemas
class SaleBase(BaseModel):
    medicine_id: int
    quantity: int
    subtotal: float
    client_id: int
    sale_date: datetime
    user_id: int
    document_type: str = "invoice"  # "invoice" or "remission"
    iva_rate: float = 0.16
    shipping_date: Optional[date] = None
    shipping_status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class SaleUpdate(BaseModel):
    medicine_id: Optional[int] = None
    quantity: Optional[int] = None
    subtotal: Optional[float] = None
    client_id: Optional[int] = None
    sale_date: Optional[datetime] = None
    user_id: Optional[int] = None
    document_type: Optional[str] = None
    iva_rate: Optional[float] = None
    shipping_date: Optional[date] = None
    shipping_status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None

class Sale(SaleBase):
    id: int
    iva_amount: float
    total_with_iva: float
    total_price: float  # Para compatibilidad
    medicine: Medicine
    client: Client
    user: User
    invoice_id: Optional[int] = None
    invoice: Optional[Invoice] = None

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
    sale_id: Optional[int] = None
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



# Actualizar referencias si es necesario después de definir todas las clases
# Por ejemplo, si Client necesita mostrar Sales:
# Client.model_rebuild() # O usar forward references con strings 'Sale'
