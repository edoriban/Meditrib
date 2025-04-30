from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.crud import crud_role  # Asegúrate que la ruta de importación sea correcta

router = APIRouter(
    prefix="/roles",
    tags=["roles"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Role)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    db_role = crud_role.get_role_by_name(db, name=role.name)
    if db_role:
        raise HTTPException(status_code=400, detail="Role already registered")
    return crud_role.create_role(db=db, role=role)


@router.get("/", response_model=List[schemas.Role])
def read_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    roles = crud_role.get_roles(db, skip=skip, limit=limit)
    return roles


@router.get("/{role_id}", response_model=schemas.Role)
def read_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return db_role


@router.put("/{role_id}", response_model=schemas.Role)
def update_role(role_id: int, role: schemas.RoleUpdate, db: Session = Depends(get_db)):
    db_role = crud_role.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    # Opcional: Verificar si el nuevo nombre ya existe si se está actualizando
    if role.name:
        existing_role = crud_role.get_role_by_name(db, name=role.name)
        if existing_role and existing_role.id != role_id:
            raise HTTPException(status_code=400, detail="Role name already registered")
    return crud_role.update_role(db=db, role_id=role_id, role_update=role)


@router.delete("/{role_id}", response_model=schemas.Role)
def delete_role(role_id: int, db: Session = Depends(get_db)):
    db_role = crud_role.get_role(db, role_id=role_id)
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    # Considerar lógica adicional si el rol está asignado a usuarios
    return crud_role.delete_role(db=db, role_id=role_id)
