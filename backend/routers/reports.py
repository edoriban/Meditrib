from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.core.dependencies import get_db
from backend.core import schemas
from backend.core.crud import crud_report, crud_user 

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    # Validar que el usuario generador existe
    db_user = crud_user.get_user(db, user_id=report.generated_by)
    if not db_user:
        raise HTTPException(status_code=404, detail="Generating user not found")
    # Aquí podría ir lógica para generar el 'data' del reporte basado en 'report_type'
    return crud_report.create_report(db=db, report=report)


@router.get("/", response_model=List[schemas.Report])
def read_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reports = crud_report.get_reports(db, skip=skip, limit=limit)
    return reports


@router.get("/{report_id}", response_model=schemas.Report)
def read_report(report_id: int, db: Session = Depends(get_db)):
    db_report = crud_report.get_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return db_report


@router.put("/{report_id}", response_model=schemas.Report)
def update_report(report_id: int, report: schemas.ReportUpdate, db: Session = Depends(get_db)):
    db_report = crud_report.get_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    # Validar usuario si se cambia generated_by
    if report.generated_by and not crud_user.get_user(db, user_id=report.generated_by):
        raise HTTPException(status_code=404, detail="Generating user not found")
    return crud_report.update_report(db=db, report_id=report_id, report_update=report)


@router.delete("/{report_id}", response_model=schemas.Report)
def delete_report(report_id: int, db: Session = Depends(get_db)):
    db_report = crud_report.get_report(db, report_id=report_id)
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return crud_report.delete_report(db=db, report_id=report_id)
