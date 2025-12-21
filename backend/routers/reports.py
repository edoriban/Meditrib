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
    get_daily_sales_trend,
    get_top_selling_products,
    get_fulfillment_stats,
    get_dashboard_comparison
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


@router.get("/top-selling")
def read_top_selling(limit: int = 10, db: Session = Depends(get_db)):
    """Get top 10 best selling products"""
    return get_top_selling_products(db, limit)


@router.get("/dashboard-comparison")
def read_dashboard_comparison(timeframe: str = "30d", db: Session = Depends(get_db)):
    """Get dashboard stats comparison"""
    return get_dashboard_comparison(db, timeframe)


@router.get("/fulfillment-stats")
def read_fulfillment_stats(db: Session = Depends(get_db)):
    """Get fulfillment alerts and stats"""
    return get_fulfillment_stats(db)
