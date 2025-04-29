from typing import Optional, List
from pydantic import BaseModel


class MedicineBase(BaseModel):
    name: str
    description: Optional[str] = None
    sale_price: float
    # Hacer purchase_price opcional
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
    expiry_date: Optional[str] = None


class InventoryCreate(InventoryBase):
    pass


class InventoryUpdate(InventoryBase):
    quantity: Optional[int] = None
    batch: Optional[str] = None
    expiry_date: Optional[str] = None


class Inventory(InventoryBase):
    id: int

    class Config:
        from_attributes = True


class MedicineWithInventory(Medicine):
    inventory: Optional[Inventory] = None


class SupplierBase(BaseModel):
    name: str
    contact_info: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    name: Optional[str] = None
    contact_info: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None


class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True
