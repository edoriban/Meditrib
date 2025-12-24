from backend.core.database import SessionLocal, engine
from backend.core import models, schemas
from backend.core.crud import crud_role
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    """Initialize database with default data"""
    # Create tables if they don't exist
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create default tenant if it doesn't exist
        default_tenant = db.query(models.Tenant).first()
        if not default_tenant:
            default_tenant = models.Tenant(name="VanPOS Demo", slug="vanpos-demo")
            db.add(default_tenant)
            db.commit()
            db.refresh(default_tenant)
            print(f"[INIT_DB] Created default tenant: {default_tenant.name}")
        
        # 2. Create default roles if they don't exist
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
        
        # 3. Create admin test user if it doesn't exist
        admin_email = "admin@vanpos.mx"
        existing_admin = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if not existing_admin:
            admin_role = db.query(models.Role).filter(models.Role.name == "Admin").first()
            hashed_password = pwd_context.hash("admin123")
            
            admin_user = models.User(
                name="Admin VanPOS",
                email=admin_email,
                password=hashed_password,
                role_id=admin_role.id,
                tenant_id=default_tenant.id,
                is_owner=True
            )
            db.add(admin_user)
            db.commit()
            print(f"[INIT_DB] Created admin user: {admin_email} / admin123")
        else:
            # Ensure existing admin has tenant_id and is_owner set
            update_needed = False
            if not existing_admin.tenant_id:
                existing_admin.tenant_id = default_tenant.id
                update_needed = True
            if not existing_admin.is_owner:
                existing_admin.is_owner = True
                update_needed = True
            
            if update_needed:
                db.commit()
                print(f"[INIT_DB] Updated admin user with tenant_id/is_owner")
        
        # 4. Mark setup as completed for the default tenant
        setup_setting = db.query(models.AppSettings).filter(
            models.AppSettings.tenant_id == default_tenant.id,
            models.AppSettings.key == "setup_completed"
        ).first()
        
        if not setup_setting:
            setup_setting = models.AppSettings(
                tenant_id=default_tenant.id,
                key="setup_completed",
                value="true"
            )
            db.add(setup_setting)
            db.commit()
            print(f"[INIT_DB] Set setup_completed=true for tenant {default_tenant.name}")
        
    except Exception as e:
        print(f"[INIT_DB] Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()