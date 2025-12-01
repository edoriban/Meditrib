from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.core.schemas import Alert, AlertCreate, AlertUpdate
from backend.core.crud.crud_alert import (
    get_alerts, get_alert, create_alert, update_alert,
    delete_alert, resolve_alert, check_and_create_alerts
)

router = APIRouter()


@router.get("/", response_model=List[Alert])
def read_alerts(skip: int = 0, limit: int = 100, active_only: bool = True, db: Session = Depends(get_db)):
    alerts = get_alerts(db, skip=skip, limit=limit, active_only=active_only)
    return alerts


@router.get("/{alert_id}", response_model=Alert)
def read_alert(alert_id: int, db: Session = Depends(get_db)):
    db_alert = get_alert(db, alert_id=alert_id)
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return db_alert


@router.post("/", response_model=Alert)
def create_new_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    return create_alert(db, alert)


@router.put("/{alert_id}", response_model=Alert)
def update_existing_alert(alert_id: int, alert: AlertUpdate, db: Session = Depends(get_db)):
    db_alert = update_alert(db, alert_id=alert_id, alert_update=alert)
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return db_alert


@router.delete("/{alert_id}")
def delete_existing_alert(alert_id: int, db: Session = Depends(get_db)):
    success = delete_alert(db, alert_id=alert_id)
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert deleted successfully"}


@router.post("/{alert_id}/resolve", response_model=Alert)
def resolve_existing_alert(alert_id: int, db: Session = Depends(get_db)):
    db_alert = resolve_alert(db, alert_id=alert_id)
    if db_alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return db_alert


@router.post("/check")
def check_alerts(db: Session = Depends(get_db)):
    """Endpoint to manually trigger alert checking"""
    check_and_create_alerts(db)
    return {"message": "Alert check completed"}