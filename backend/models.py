from backend.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship


class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    sale_price = Column(Float)
    inventory = relationship("Inventory", uselist=False, back_populates="medicine")
    suppliers = relationship("SupplierMedicine", back_populates="medicine")


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    medicines = relationship("SupplierMedicine", back_populates="supplier")


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
