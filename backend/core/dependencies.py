"""
Dependencies for FastAPI endpoints.
"""

from fastapi import Depends, HTTPException

from . import models

# Re-export get_db from database to avoid circular imports
from .database import get_db
from .security import get_current_user

# Export get_db so routers can import it from here
__all__ = ["get_db", "get_tenant_id"]


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    """Dependency to get the current tenant ID from the authenticated user"""
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id
