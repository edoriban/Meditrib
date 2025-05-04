from typing import Optional, List
from pydantic import BaseModel, EmailStr

# Esquemas para medicamentos

class InventoryBase(BaseModel):
    quantity: int
    batch: Optional[str] = None
    expiry_date: Optional[str] = None

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    medicine_id: int
    
    class Config:
        from_attributes = True

class MedicineBase(BaseModel):
    name: str
    description: Optional[str] = None
    sale_price: float
    purchase_price: Optional[float] = None
    type: Optional[str] = None
    supplier_id: Optional[int] = None

class MedicineCreate(MedicineBase):
    inventory: Optional[InventoryCreate] = None

class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None
    type: Optional[str] = None
    supplier_id: Optional[int] = None
    inventory: Optional[InventoryCreate] = None

class Medicine(MedicineBase):
    id: int
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

# Client Schemas
class ClientBase(BaseModel):
    name: str
    contact: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(ClientBase):
    name: Optional[str] = None
    contact: Optional[str] = None

class Client(ClientBase):
    id: int
    # sales: List['Sale'] = [] # Evitar dependencia circular o definir Sale antes si se necesita

    class Config:
        from_attributes = True

# Sale Schemas
class SaleBase(BaseModel):
    medicine_id: int
    quantity: int
    total_price: float
    client_id: int

class SaleCreate(SaleBase):
    pass

class SaleUpdate(SaleBase):
    medicine_id: Optional[int] = None
    quantity: Optional[int] = None
    total_price: Optional[float] = None
    client_id: Optional[int] = None

class Sale(SaleBase):
    id: int
    medicine: Medicine  # Incluir la medicina asociada
    client: Client  # Incluir el cliente asociado

    class Config:
        from_attributes = True

# Report Schemas
class ReportBase(BaseModel):
    report_type: str
    date: str  # Considerar usar date o datetime de Pydantic/Python
    data: str  # Considerar usar dict o list si el formato es JSON
    generated_by: int

class ReportCreate(ReportBase):
    pass

class ReportUpdate(ReportBase):
    report_type: Optional[str] = None
    date: Optional[str] = None
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
