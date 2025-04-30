from backend.core.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship


class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    type = Column(String, nullable=True)
    purchase_price = Column(Float)
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


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    username = Column(String, unique=True)
    password = Column(String)
    role_id = Column(ForeignKey("roles.id"))
    role = relationship("Role", back_populates="users")


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    users = relationship("User", back_populates="role")


class Sale(Base):
    __tablename__ = "sales"
    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(ForeignKey("medicines.id"))
    quantity = Column(Integer)
    total_price = Column(Float)
    medicine = relationship("Medicine")
    client_id = Column(ForeignKey("clients.id"))
    client = relationship("Client", back_populates="sales")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    sales = relationship("Sale", back_populates="client")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String)  # e.g., "sales", "inventory"
    date = Column(String)  # Date of the report
    data = Column(String)  # JSON or CSV data of the report
    generated_by = Column(ForeignKey("users.id"))
    user = relationship("User")
