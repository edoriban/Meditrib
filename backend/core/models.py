from backend.core.database import Base
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date


medicine_tag_association = Table(
    "medicine_tag_association",
    Base.metadata,
    Column("medicine_id", Integer, ForeignKey("medicines.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("medicine_tags.id"), primary_key=True)
)

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
    purchase_order_items = relationship("PurchaseOrderItem", back_populates="medicine")
    tags = relationship("MedicineTag", secondary=medicine_tag_association, backref="medicines")

class MedicineTag(Base):
    __tablename__ = "medicine_tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    color = Column(String, nullable=True)

class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    medicines = relationship("SupplierMedicine", back_populates="supplier")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")


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
    sale_date = Column(DateTime, default=datetime.now)
    shipping_date = Column(Date, nullable=True)
    shipping_status = Column(String, default="pending")  # e.g., "pending", "completed", "canceled"
    payment_status = Column(String, default="pending")  # e.g., "pending", "paid", "refunded"
    payment_method = Column(String, nullable=True)  # e.g., "credit_card", "cash", "insurance"
    user_id = Column(ForeignKey("users.id"))
    user = relationship("User")
    medicine = relationship("Medicine")
    client_id = Column(ForeignKey("clients.id"))
    client = relationship("Client", back_populates="sales")


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    contact = Column(String)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)
    sales = relationship("Sale", back_populates="client")


class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    report_type = Column(String)  # e.g., "sales", "inventory"
    date = Column(DateTime)  # Date of the report
    data = Column(String)  # JSON or CSV data of the report
    generated_by = Column(ForeignKey("users.id"))
    user = relationship("User")

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(ForeignKey("suppliers.id"))
    order_date = Column(DateTime)
    expected_delivery_date = Column(DateTime, nullable=True)
    status = Column(String, default="pending")  # e.g., "pending", "shipped", "received", "canceled"
    total_amount = Column(Float, nullable=True)
    created_by = Column(ForeignKey("users.id"))

    created_by_user = relationship("User", foreign_keys=[created_by])
    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    purchase_order_id = Column(ForeignKey("purchase_orders.id"), primary_key=True)
    medicine_id = Column(ForeignKey("medicines.id"), primary_key=True)
    quantity = Column(Integer)
    unit_price = Column(Float)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    medicine = relationship("Medicine")