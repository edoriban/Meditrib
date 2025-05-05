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
    total_price: float
    client_id: int
    sale_date: datetime
    user_id: int
    shipping_date: Optional[date] = None
    shipping_status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None

class SaleCreate(SaleBase):
    pass

class SaleUpdate(BaseModel):
    medicine_id: Optional[int] = None
    quantity: Optional[int] = None
    total_price: Optional[float] = None
    client_id: Optional[int] = None
    sale_date: Optional[datetime] = None
    user_id: Optional[int] = None
    shipping_date: Optional[date] = None
    shipping_status: Optional[str] = None
    payment_status: Optional[str] = None
    payment_method: Optional[str] = None

class Sale(SaleBase):
    id: int
    medicine: Medicine
    client: Client
    user: User

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

# Token Schemas

class Token(BaseModel):
    access_token: str
    token_type: str



# Actualizar referencias si es necesario después de definir todas las clases
# Por ejemplo, si Client necesita mostrar Sales:
# Client.model_rebuild() # O usar forward references con strings 'Sale'
