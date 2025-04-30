from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.crud import crud_client  # Asegúrate que la ruta de importación sea correcta

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = crud_client.get_client_by_name(db, name=client.name)
    if db_client:
        raise HTTPException(status_code=400, detail="Client name already registered")
    return crud_client.create_client(db=db, client=client)


@router.get("/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = crud_client.get_clients(db, skip=skip, limit=limit)
    return clients


@router.get("/{client_id}", response_model=schemas.Client)
def read_client(client_id: int, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client


@router.put("/{client_id}", response_model=schemas.Client)
def update_client(client_id: int, client: schemas.ClientUpdate, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    # Opcional: Verificar si el nuevo nombre ya existe si se está actualizando
    if client.name:
        existing_client = crud_client.get_client_by_name(db, name=client.name)
        if existing_client and existing_client.id != client_id:
            raise HTTPException(status_code=400, detail="Client name already registered")
    return crud_client.update_client(db=db, client_id=client_id, client_update=client)


@router.delete("/{client_id}", response_model=schemas.Client)
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = crud_client.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    # Considerar lógica adicional si el cliente tiene ventas asociadas
    return crud_client.delete_client(db=db, client_id=client_id)
