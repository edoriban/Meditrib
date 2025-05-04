from sqlalchemy.orm import Session
from backend.core import models, schemas


def get_medicine_tag(db: Session, tag_id: int):
    return db.query(models.MedicineTag).filter(models.MedicineTag.id == tag_id).first()


def get_medicine_tag_by_name(db: Session, name: str):
    return db.query(models.MedicineTag).filter(models.MedicineTag.name == name).first()


def get_medicine_tags(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.MedicineTag).offset(skip).limit(limit).all()


def create_medicine_tag(db: Session, tag: schemas.MedicineTagCreate):
    db_tag = models.MedicineTag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


def update_medicine_tag(db: Session, tag_id: int, tag: schemas.MedicineTagUpdate):
    db_tag = get_medicine_tag(db, tag_id=tag_id)
    if db_tag:
        update_data = tag.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_tag, key, value)
        db.commit()
        db.refresh(db_tag)
    return db_tag


def delete_medicine_tag(db: Session, tag_id: int):
    db_tag = get_medicine_tag(db, tag_id=tag_id)
    if db_tag:
        db.delete(db_tag)
        db.commit()
    return db_tag