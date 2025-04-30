from sqlalchemy.orm import Session
from backend.core import models, schemas


def get_report(db: Session, report_id: int):
    return db.query(models.Report).filter(models.Report.id == report_id).first()


def get_reports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Report).offset(skip).limit(limit).all()


def create_report(db: Session, report: schemas.ReportCreate):
    db_report = models.Report(**report.model_dump())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


def update_report(db: Session, report_id: int, report_update: schemas.ReportUpdate):
    db_report = get_report(db, report_id)
    if db_report:
        update_data = report_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_report, key, value)
        db.commit()
        db.refresh(db_report)
    return db_report


def delete_report(db: Session, report_id: int):
    db_report = get_report(db, report_id)
    if db_report:
        db.delete(db_report)
        db.commit()
    return db_report


def get_reports_by_type(db: Session, report_type: str, skip: int = 0, limit: int = 100):
    return db.query(models.Report).filter(models.Report.report_type == report_type).offset(skip).limit(limit).all()


def get_reports_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Report).filter(models.Report.generated_by == user_id).offset(skip).limit(limit).all()
