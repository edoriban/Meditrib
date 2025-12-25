from sqlalchemy.orm import Session

from backend.core import models, schemas


def get_client(db: Session, client_id: int, tenant_id: int = None):
    query = db.query(models.Client).filter(models.Client.id == client_id)
    if tenant_id:
        query = query.filter(models.Client.tenant_id == tenant_id)
    return query.first()


def get_client_by_name(db: Session, name: str, tenant_id: int = None):
    query = db.query(models.Client).filter(models.Client.name == name)
    if tenant_id:
        query = query.filter(models.Client.tenant_id == tenant_id)
    return query.first()


def get_clients(db: Session, tenant_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Client)
    if tenant_id:
        query = query.filter(models.Client.tenant_id == tenant_id)
    return query.offset(skip).limit(limit).all()


def create_client(db: Session, client: schemas.ClientCreate, tenant_id: int = None):
    client_data = client.model_dump()
    if tenant_id:
        client_data["tenant_id"] = tenant_id
    db_client = models.Client(**client_data)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


def update_client(db: Session, client_id: int, client_update: schemas.ClientUpdate, tenant_id: int = None):
    db_client = get_client(db, client_id, tenant_id)
    if db_client:
        update_data = client_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client


def delete_client(db: Session, client_id: int, tenant_id: int = None):
    db_client = get_client(db, client_id, tenant_id)
    if db_client:
        db.delete(db_client)
        db.commit()
    return db_client
