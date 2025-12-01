from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.core.schemas import Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory, ExpenseCategoryCreate, ExpenseCategoryUpdate
from backend.core.crud.crud_expense import (
    get_expenses, get_expense, create_expense, update_expense, delete_expense,
    get_expense_categories, get_expense_category, create_expense_category,
    update_expense_category, delete_expense_category, initialize_default_categories,
    get_expense_summary
)

router = APIRouter()


# Expense endpoints
@router.post("/", response_model=Expense)
def create_new_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return create_expense(db, expense)


@router.get("/", response_model=List[Expense])
def read_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    expenses = get_expenses(db, skip=skip, limit=limit)
    return expenses


@router.get("/{expense_id}", response_model=Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    db_expense = get_expense(db, expense_id=expense_id)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense


@router.put("/{expense_id}", response_model=Expense)
def update_existing_expense(expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db)):
    db_expense = update_expense(db, expense_id=expense_id, expense_update=expense)
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return db_expense


@router.delete("/{expense_id}")
def delete_existing_expense(expense_id: int, db: Session = Depends(get_db)):
    success = delete_expense(db, expense_id=expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}


# Expense Categories endpoints
@router.post("/categories/", response_model=ExpenseCategory)
def create_new_expense_category(category: ExpenseCategoryCreate, db: Session = Depends(get_db)):
    return create_expense_category(db, category)


@router.get("/categories/", response_model=List[ExpenseCategory])
def read_expense_categories(db: Session = Depends(get_db)):
    return get_expense_categories(db)


@router.get("/categories/{category_id}", response_model=ExpenseCategory)
def read_expense_category(category_id: int, db: Session = Depends(get_db)):
    db_category = get_expense_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Expense category not found")
    return db_category


@router.put("/categories/{category_id}", response_model=ExpenseCategory)
def update_existing_expense_category(category_id: int, category: ExpenseCategoryUpdate, db: Session = Depends(get_db)):
    db_category = update_expense_category(db, category_id=category_id, category_update=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Expense category not found")
    return db_category


@router.delete("/categories/{category_id}")
def delete_existing_expense_category(category_id: int, db: Session = Depends(get_db)):
    success = delete_expense_category(db, category_id=category_id)
    if not success:
        raise HTTPException(status_code=400, detail="Cannot delete category with expenses")
    return {"message": "Expense category deleted successfully"}


@router.post("/initialize-default-categories")
def initialize_categories(db: Session = Depends(get_db)):
    """Initialize default expense categories for pharmaceutical distribution"""
    initialize_default_categories(db)
    return {"message": "Default categories initialized successfully"}


@router.get("/summary")
def get_expenses_summary(db: Session = Depends(get_db)):
    """Get expense summary with totals by category"""
    return get_expense_summary(db)