from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db, get_tenant_id
from backend.core import schemas
from backend.core.crud import crud_product_tags

router = APIRouter(
    prefix="/product-tags",
    tags=["product-tags"],
    responses={404: {"description": "Tag not found"}},
)


@router.post("/", response_model=schemas.ProductTag)
def create_product_tag(
    tag: schemas.ProductTagCreate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_tag = crud_product_tags.get_product_tag_by_name(db, name=tag.name, tenant_id=tenant_id)
    if db_tag:
        raise HTTPException(status_code=400, detail="Tag already registered")
    return crud_product_tags.create_product_tag(db=db, tag=tag, tenant_id=tenant_id)


@router.get("/", response_model=List[schemas.ProductTag])
def read_product_tags(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return crud_product_tags.get_product_tags(db, skip=skip, limit=limit, tenant_id=tenant_id)


@router.get("/{tag_id}", response_model=schemas.ProductTag)
def read_product_tag(
    tag_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_tag = crud_product_tags.get_product_tag(db, tag_id=tag_id)
    if db_tag is None or db_tag.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag


@router.put("/{tag_id}", response_model=schemas.ProductTag)
def update_product_tag(
    tag_id: int, 
    tag: schemas.ProductTagUpdate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_tag = crud_product_tags.get_product_tag(db, tag_id=tag_id)
    if db_tag is None or db_tag.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud_product_tags.update_product_tag(db=db, tag_id=tag_id, tag=tag)


@router.delete("/{tag_id}", response_model=schemas.ProductTag)
def delete_product_tag(
    tag_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_tag = crud_product_tags.get_product_tag(db, tag_id=tag_id)
    if db_tag is None or db_tag.tenant_id != tenant_id:
        raise HTTPException(status_code=404, detail="Tag not found")
    return crud_product_tags.delete_product_tag(db=db, tag_id=tag_id)