from sqlalchemy.orm import Session
from backend.core import models, schemas
# Importa aquí tu utilidad de hash de contraseñas, ej: from backend.security import get_password_hash


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    # Asegúrate de hashear la contraseña antes de guardarla
    # hashed_password = get_password_hash(user.password)
    # db_user = models.User(**user.model_dump(exclude={'password'}), password=hashed_password)
    # Por ahora, se guarda la contraseña en texto plano (NO RECOMENDADO PARA PRODUCCIÓN)
    db_user = models.User(**user.model_dump())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data and update_data["password"]:
            # Hashea la nueva contraseña si se proporciona
            # hashed_password = get_password_hash(update_data["password"])
            # update_data["password"] = hashed_password
            pass  # Reemplaza con la lógica de hash
        for key, value in update_data.items():
            setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
