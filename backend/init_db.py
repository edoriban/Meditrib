from backend.core.database import SessionLocal, engine
from backend.core import models, schemas
from backend.core.crud import crud_role

def init_db():
    db = SessionLocal()
    try:
        roles = db.query(models.Role).all()
        if not roles:
            roles_data = [
                schemas.RoleCreate(name="Usuario", description="Usuario normal del sistema"),
                schemas.RoleCreate(name="Admin", description="Administrador del sistema"),
            ]
            for role_data in roles_data:
                crud_role.create_role(db, role_data)
    finally:
        db.close()

if __name__ == "__main__":
    init_db()