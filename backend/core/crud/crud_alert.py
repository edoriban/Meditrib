from sqlalchemy.orm import Session
from backend.core.models import Alert
from backend.core.schemas import AlertCreate, AlertUpdate
from typing import List, Optional
from datetime import datetime


def get_alerts(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Alert]:
    query = db.query(Alert)
    if active_only:
        query = query.filter(Alert.is_active == True)
    return query.offset(skip).limit(limit).all()


def get_alert(db: Session, alert_id: int) -> Optional[Alert]:
    return db.query(Alert).filter(Alert.id == alert_id).first()


def create_alert(db: Session, alert: AlertCreate) -> Alert:
    db_alert = Alert(**alert.model_dump())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert


def update_alert(db: Session, alert_id: int, alert_update: AlertUpdate) -> Optional[Alert]:
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if db_alert:
        for key, value in alert_update.model_dump(exclude_unset=True).items():
            setattr(db_alert, key, value)
        db.commit()
        db.refresh(db_alert)
    return db_alert


def delete_alert(db: Session, alert_id: int) -> bool:
    db_alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if db_alert:
        db.delete(db_alert)
        db.commit()
        return True
    return False


def resolve_alert(db: Session, alert_id: int) -> Optional[Alert]:
    return update_alert(db, alert_id, AlertUpdate(is_active=False, resolved_at=datetime.now()))


def check_and_create_alerts(db: Session):
    """Check inventory and expiration dates to create alerts"""
    from backend.core.models import Medicine, Inventory
    from datetime import date, timedelta

    # Get all medicines with inventory
    medicines = db.query(Medicine).join(Inventory).all()

    for medicine in medicines:
        inventory_qty = medicine.inventory.quantity if medicine.inventory else 0

        # Check low stock (less than 10 units)
        if inventory_qty < 10 and inventory_qty > 0:
            existing_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.type == "low_stock",
                Alert.is_active == True
            ).first()

            if not existing_alert:
                create_alert(db, AlertCreate(
                    type="low_stock",
                    message=f"Stock bajo: {medicine.name} tiene solo {inventory_qty} unidades",
                    medicine_id=medicine.id,
                    severity="medium"
                ))

        # Check critical stock (0 units)
        elif inventory_qty == 0:
            existing_alert = db.query(Alert).filter(
                Alert.medicine_id == medicine.id,
                Alert.type == "critical_stock",
                Alert.is_active == True
            ).first()

            if not existing_alert:
                create_alert(db, AlertCreate(
                    type="critical_stock",
                    message=f"Sin stock: {medicine.name} está agotado",
                    medicine_id=medicine.id,
                    severity="high"
                ))

        # Check expiring medicines (within 30 days)
        if medicine.expiration_date:
            days_until_expiry = (medicine.expiration_date - date.today()).days

            if days_until_expiry <= 30 and days_until_expiry > 0:
                existing_alert = db.query(Alert).filter(
                    Alert.medicine_id == medicine.id,
                    Alert.type == "expiring",
                    Alert.is_active == True
                ).first()

                if not existing_alert:
                    severity = "high" if days_until_expiry <= 7 else "medium"
                    create_alert(db, AlertCreate(
                        type="expiring",
                        message=f"Caduca pronto: {medicine.name} expira en {days_until_expiry} días",
                        medicine_id=medicine.id,
                        severity=severity
                    ))

            # Check expired medicines
            elif days_until_expiry <= 0:
                existing_alert = db.query(Alert).filter(
                    Alert.medicine_id == medicine.id,
                    Alert.type == "expired",
                    Alert.is_active == True
                ).first()

                if not existing_alert:
                    create_alert(db, AlertCreate(
                        type="expired",
                        message=f"Expirado: {medicine.name} caducó hace {-days_until_expiry} días",
                        medicine_id=medicine.id,
                        severity="critical"
                    ))