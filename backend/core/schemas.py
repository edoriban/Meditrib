from typing import Optional, List
from pydantic import BaseModel, EmailStr


class MedicineBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None
    supplier_id: Optional[int] = None


class MedicineCreate(MedicineBase):
    # purchase_price sigue siendo requerido para la creación si es necesario
    purchase_price: float
    pass


class MedicineUpdate(MedicineBase):
    name: Optional[str] = None
    sale_price: Optional[float] = None
    purchase_price: Optional[float] = None


class Medicine(MedicineBase):
    id: int

    class Config:
        from_attributes = True


class InventoryBase(BaseModel):
    medicine_id: int
    quantity: int
    batch: Optional[str] = None
    expiry_date: Optional[str] = None  # Asegúrate que este campo existe en el modelo si es necesario


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    medicine_id: Optional[int] = None  # Hacer medicine_id opcional en update
    quantity: Optional[int] = None
    batch: Optional[str] = None
    expiry_date: Optional[str] = None


class Inventory(InventoryBase):
    id: int  # Asumiendo que Inventory tiene un id propio o usa medicine_id como PK

    class Config:
        from_attributes = True


class MedicineWithInventory(Medicine):
    inventory: Optional[Inventory] = None


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


# Actualizar referencias si es necesario después de definir todas las clases
# Por ejemplo, si Client necesita mostrar Sales:
# Client.model_rebuild() # O usar forward references con strings 'Sale'
