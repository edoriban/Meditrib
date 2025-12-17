"""
Pytest Fixtures for Meditrib Tests
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.core.database import Base
from backend.core.dependencies import get_db
from backend.main import app


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_user(db_session):
    """Create a sample user for tests that require user_id"""
    from backend.core.models import User, Role
    import bcrypt
    
    # Create role first (User has FK to Role)
    role = Role(name="admin", description="Admin role")
    db_session.add(role)
    db_session.flush()
    
    # Use bcrypt directly
    hashed = bcrypt.hashpw("testpassword123".encode(), bcrypt.gensalt()).decode()
    
    user = User(
        name="test_user",  # Field is 'name', not 'username'
        email="testuser@example.com",
        password=hashed,  # Field is 'password', not 'hashed_password'
        role_id=role.id,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_medicine(db_session):
    from backend.core.models import Medicine, Inventory
    
    medicine = Medicine(
        name="Test Paracetamol 500mg",
        barcode="7501234567890",
        purchase_price=10.00,
        sale_price=15.00,
        iva_rate=0.16,
        laboratory="Test Lab",
        active_substance="Paracetamol",
    )
    db_session.add(medicine)
    db_session.flush()
    
    inventory = Inventory(medicine_id=medicine.id, quantity=100)
    db_session.add(inventory)
    db_session.commit()
    db_session.refresh(medicine)
    return medicine


@pytest.fixture
def sample_client(db_session):
    from backend.core.models import Client
    
    client = Client(
        name="Cliente de Prueba",
        email="test@example.com",
        contact="5551234567",
    )
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    return client
