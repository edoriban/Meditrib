\"\"\"
Expenses router with multi-tenant support.
\"\"\"
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from backend.core.dependencies import get_db, get_tenant_id
from backend.core.security import get_current_user
from backend.core import models
from backend.core.schemas import Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory, ExpenseCategoryCreate, ExpenseCategoryUpdate

router = APIRouter()

@router.get(\"/\", response_model=List[Expense])
def read_expenses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Expense).filter(
        models.Expense.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()

@router.post(\"/\", response_model=Expense)
def create_expense(
    expense: ExpenseCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=403, detail=\"User not associated with a tenant\")
    
    db_expense = models.Expense(
        tenant_id=tenant_id,
        created_by=current_user.id,
        **expense.model_dump()
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get(\"/summary\")
def get_expenses_summary(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.tenant_id == tenant_id
    ).all()
    
    by_category = {}
    for exp in expenses:
        cat_name = exp.category.name if exp.category else \"Sin categoría\"
        by_category[cat_name] = by_category.get(cat_name, 0) + exp.amount
    
    return {
        \"total\": sum(e.amount for e in expenses),
        \"count\": len(expenses),
        \"by_category\": by_category
    }

@router.get(\"/{expense_id}\", response_model=Expense)
def read_expense(
    expense_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.tenant_id == tenant_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail=\"Expense not found\")
    return expense

@router.put(\"/{expense_id}\", response_model=Expense)
def update_expense(
    expense_id: int, 
    expense_update: ExpenseUpdate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.tenant_id == tenant_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail=\"Expense not found\")
    
    for key, value in expense_update.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete(\"/{expense_id}\")
def delete_expense(
    expense_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.tenant_id == tenant_id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail=\"Expense not found\")
    db.delete(expense)
    db.commit()
    return {\"message\": \"Expense deleted successfully\"}

@router.get(\"/categories/\", response_model=List[ExpenseCategory])
def read_expense_categories(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.ExpenseCategory).filter(
        models.ExpenseCategory.tenant_id == tenant_id
    ).all()

@router.post(\"/categories/\", response_model=ExpenseCategory)
def create_expense_category(
    category: ExpenseCategoryCreate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    db_category = models.ExpenseCategory(
        tenant_id=tenant_id,
        **category.model_dump()
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category
