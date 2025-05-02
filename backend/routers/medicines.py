from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Actualizar importaciones
# Importar get_db desde core.dependencies
from backend.core.dependencies import get_db
from backend.core import models  # Importar modelos desde core
from backend.core.crud import crud_medicines 

# Importar schemas desde core.schemas
from backend.core import schemas

router = APIRouter(
    prefix="/medicines",
    tags=["medicines"],
    # dependencies=[Depends(get_current_user)], # Example dependency
    responses={404: {"description": "Not found"}},
)


# Ejemplo de ruta usando las nuevas importaciones
@router.get("/", response_model=List[schemas.Medicine])
def read_medicines(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    medicines = crud_medicines.get_medicines(db, skip=skip, limit=limit)
    return medicines


@router.post("/", response_model=schemas.Medicine)
def create_medicine(medicine: schemas.MedicineCreate, db: Session = Depends(get_db)):
    return crud_medicines.create_medicine(db=db, medicine=medicine)


@router.get("/{medicine_id}", response_model=schemas.Medicine)
def read_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return db_medicine


@router.put("/{medicine_id}", response_model=schemas.Medicine)
def update_medicine(medicine_id: int, medicine: schemas.MedicineUpdate, db: Session = Depends(get_db)):
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return crud_medicines.update_medicine(db=db, medicine_id=medicine_id, medicine=medicine)


@router.delete("/{medicine_id}", response_model=schemas.Medicine)
def delete_medicine(medicine_id: int, db: Session = Depends(get_db)):
    db_medicine = crud_medicines.get_medicine(db, medicine_id=medicine_id)
    if db_medicine is None:
        raise HTTPException(status_code=404, detail="Medicamento no encontrado")
    return crud_medicines.delete_medicine(db=db, medicine_id=medicine_id)
