from pydantic import BaseModel


class MedicineBase(BaseModel):
    name: str
    sale_price: float
    description: str | None = None


class MedicineCreate(MedicineBase):
    pass


class Medicine(MedicineBase):
    id: int

    class Config:
        from_attributes = True


class SupplierBase(BaseModel):
    name: str
    contact: str


class SupplierCreate(SupplierBase):
    pass


class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True
