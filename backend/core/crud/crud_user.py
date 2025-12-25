from sqlalchemy.orm import Session

from backend.core import models, schemas
from backend.core.password import get_password_hash


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)

    # Check if this is the first user (will be admin)
    user_count = db.query(models.User).count()
    is_first_user = user_count == 0

    # Get or create the appropriate role
    role_name = "Admin" if is_first_user else "Usuario"
    role = db.query(models.Role).filter(models.Role.name == role_name).first()

    if not role:
        # Create the role if it doesn't exist
        role = models.Role(
            name=role_name, description="Administrador del sistema" if is_first_user else "Usuario normal del sistema"
        )
        db.add(role)
        db.commit()
        db.refresh(role)

    db_user = models.User(**user.model_dump(exclude={"password"}), password=hashed_password, role_id=role.id)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            update_data["password"] = hashed_password
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id=user_id)
    if db_user:
        role = db_user.role

        user_data = {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "role": {"id": role.id, "name": role.name},
        }

        db.delete(db_user)
        db.commit()

        return user_data
    return None
