from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from backend.core.database import get_db
from backend.core.crud.crud_reports import (
    get_income_statement,
    get_product_profitability,
    get_monthly_trend,
    get_financial_summary,
    get_daily_sales_trend
)

router = APIRouter()


@router.get("/income-statement")
def read_income_statement(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Get income statement (Estado de Resultados)"""
    return get_income_statement(db, start_date, end_date)


@router.get("/product-profitability")
def read_product_profitability(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Get product profitability analysis"""
    return get_product_profitability(db, start_date, end_date)


@router.get("/monthly-trend")
def read_monthly_trend(
    months: int = Query(6, description="Number of months to analyze", ge=1, le=24),
    db: Session = Depends(get_db)
):
    """Get monthly sales and expenses trend"""
    return get_monthly_trend(db, months)


@router.get("/financial-summary")
def read_financial_summary(db: Session = Depends(get_db)):
    """Get complete financial summary with current vs last month comparison"""
    return get_financial_summary(db)


@router.get("/daily-trend")
def read_daily_trend(
    days: int = Query(90, description="Number of days to analyze", ge=7, le=365),
    db: Session = Depends(get_db)
):
    """Get daily sales and costs trend for charts"""
    return get_daily_sales_trend(db, days)
