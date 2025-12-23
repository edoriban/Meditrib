from backend.core.database import SessionLocal, engine
from backend.core import models, schemas
from backend.core.crud import crud_role

def init_db():
    """Initialize database with default data"""
    db = SessionLocal()
    try:
        # Create default roles if they don't exist
        existing_roles = db.query(models.Role).all()
        existing_role_names = [r.name for r in existing_roles]
        
        default_roles = [
            {"name": "Usuario", "description": "Usuario normal del sistema"},
            {"name": "Admin", "description": "Administrador del sistema"},
        ]
        
        for role_data in default_roles:
            if role_data["name"] not in existing_role_names:
                role = models.Role(**role_data)
                db.add(role)
        
        db.commit()
        print(f"[INIT_DB] Roles initialized: {[r.name for r in db.query(models.Role).all()]}")
        
    except Exception as e:
        print(f"[INIT_DB] Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()