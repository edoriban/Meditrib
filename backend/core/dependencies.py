\"\"\"
Dependencies for FastAPI endpoints.
\"\"\"
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from .database import SessionLocal
from .security import get_current_user
from . import models


def get_db():
    \"\"\"Get database session\"\"\"
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    \"\"\"Dependency to get the current tenant ID from the authenticated user\"\"\"
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id
