from sqlalchemy.orm import Session

from backend.core import models, schemas


def get_product_tag(db: Session, tag_id: int) -> models.ProductTag | None:
    """Get a single product tag by ID."""
    return db.query(models.ProductTag).filter(models.ProductTag.id == tag_id).first()


def get_product_tag_by_name(db: Session, name: str, tenant_id: int | None = None) -> models.ProductTag | None:
    """Get a product tag by name, optionally filtered by tenant."""
    query = db.query(models.ProductTag).filter(models.ProductTag.name == name)
    if tenant_id:
        query = query.filter(models.ProductTag.tenant_id == tenant_id)
    return query.first()


def get_product_tags(
    db: Session, skip: int = 0, limit: int = 100, tenant_id: int | None = None
) -> list[models.ProductTag]:
    """Get all product tags, optionally filtered by tenant."""
    query = db.query(models.ProductTag)
    if tenant_id:
        query = query.filter(models.ProductTag.tenant_id == tenant_id)
    return query.offset(skip).limit(limit).all()


def create_product_tag(db: Session, tag: schemas.ProductTagCreate, tenant_id: int | None = None) -> models.ProductTag:
    """Create a new product tag."""
    db_tag = models.ProductTag(name=tag.name, description=tag.description, color=tag.color, tenant_id=tenant_id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def update_product_tag(db: Session, tag_id: int, tag: schemas.ProductTagUpdate) -> models.ProductTag | None:
    """Update an existing product tag."""
    db_tag = get_product_tag(db, tag_id)
    if not db_tag:
        return None

    update_data = tag.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tag, field, value)

    db.commit()
    db.refresh(db_tag)
    return db_tag


def delete_product_tag(db: Session, tag_id: int) -> models.ProductTag | None:
    """Delete a product tag."""
    db_tag = get_product_tag(db, tag_id)
    if not db_tag:
        return None

    db.delete(db_tag)
    db.commit()
    return db_tag
