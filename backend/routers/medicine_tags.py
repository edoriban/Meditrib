from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.core.crud import crud_medicine_tags

router = APIRouter(
    prefix="/medicine-tags",
    tags=["medicine-tags"],
    responses={404: {"description": "Tag not found"}},
)


@router.post("/", response_model=schemas.MedicineTag)
def create_medicine_tag(tag: schemas.MedicineTagCreate, db: Session = Depends(get_db)):
    db_tag = crud_medicine_tags.get_medicine_tag_by_name(db, name=tag.name)
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag already registered")
    return crud_medicine_tags.create_medicine_tag(db=db, tag=tag)


@router.get("/", response_model=List[schemas.MedicineTag])
def read_medicine_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tags = crud_medicine_tags.get_medicine_tags(db, skip=skip, limit=limit)
    return tags


@router.get("/{tag_id}", response_model=schemas.MedicineTag)
def read_medicine_tag(tag_id: int, db: Session = Depends(get_db)):
    db_tag = crud_medicine_tags.get_medicine_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag


@router.put("/{tag_id}", response_model=schemas.MedicineTag)
def update_medicine_tag(tag_id: int, tag: schemas.MedicineTagUpdate, db: Session = Depends(get_db)):
    db_tag = crud_medicine_tags.get_medicine_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud_medicine_tags.update_medicine_tag(db=db, tag_id=tag_id, tag=tag)


@router.delete("/{tag_id}", response_model=schemas.MedicineTag)
def delete_medicine_tag(tag_id: int, db: Session = Depends(get_db)):
    db_tag = crud_medicine_tags.get_medicine_tag(db, tag_id=tag_id)
    if db_tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud_medicine_tags.delete_medicine_tag(db=db, tag_id=tag_id)