from sqlalchemy.orm import Session

# Actualizar la importación para que sea relativa dentro de 'core'
from .database import SessionLocal


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
