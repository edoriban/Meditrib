"""
Expenses router with multi-tenant support.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from backend.core.dependencies import get_db
from backend.core.security import get_current_user
from backend.core import models
from backend.core.schemas import Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory, ExpenseCategoryCreate, ExpenseCategoryUpdate

router = APIRouter()


def get_tenant_id(current_user: models.User = Depends(get_current_user)) -> int:
    if not current_user.tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    return current_user.tenant_id


# ============================================================================
# EXPENSE ENDPOINTS
# ============================================================================

@router.get("/", response_model=List[Expense])
def read_expenses(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.Expense).filter(
        models.Expense.tenant_id == tenant_id
    ).offset(skip).limit(limit).all()


@router.post("/", response_model=Expense)
def create_expense(
    expense: ExpenseCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tenant_id = current_user.tenant_id
    if not tenant_id:
        raise HTTPException(status_code=403, detail="User not associated with a tenant")
    
    db_expense = models.Expense(
        tenant_id=tenant_id,
        created_by=current_user.id,
        **expense.model_dump()
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


@router.get("/summary")
def get_expenses_summary(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    expenses = db.query(models.Expense).filter(
        models.Expense.tenant_id == tenant_id
    ).all()
    
    by_category = {}
    for exp in expenses:
        cat_name = exp.category.name if exp.category else "Sin categoría"
        by_category[cat_name] = by_category.get(cat_name, 0) + exp.amount
    
    return {
        "total": sum(e.amount for e in expenses),
        "count": len(expenses),
        "by_category": by_category
    }


@router.get("/{expense_id}", response_model=Expense)
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
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=Expense)
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
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for key, value in expense_update.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
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
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


# ============================================================================
# EXPENSE CATEGORY ENDPOINTS
# ============================================================================

@router.get("/categories/", response_model=List[ExpenseCategory])
def read_expense_categories(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    return db.query(models.ExpenseCategory).filter(
        models.ExpenseCategory.tenant_id == tenant_id
    ).all()


@router.post("/categories/", response_model=ExpenseCategory)
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


@router.get("/categories/{category_id}", response_model=ExpenseCategory)
def read_expense_category(
    category_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    category = db.query(models.ExpenseCategory).filter(
        models.ExpenseCategory.id == category_id,
        models.ExpenseCategory.tenant_id == tenant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.put("/categories/{category_id}", response_model=ExpenseCategory)
def update_expense_category(
    category_id: int, 
    category_update: ExpenseCategoryUpdate, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    category = db.query(models.ExpenseCategory).filter(
        models.ExpenseCategory.id == category_id,
        models.ExpenseCategory.tenant_id == tenant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    for key, value in category_update.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_expense_category(
    category_id: int, 
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    category = db.query(models.ExpenseCategory).filter(
        models.ExpenseCategory.id == category_id,
        models.ExpenseCategory.tenant_id == tenant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for associated expenses
    expenses = db.query(models.Expense).filter(
        models.Expense.category_id == category_id
    ).count()
    if expenses > 0:
        raise HTTPException(status_code=400, detail="Cannot delete category with expenses")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.post("/initialize-default-categories")
def initialize_default_categories(
    db: Session = Depends(get_db),
    tenant_id: int = Depends(get_tenant_id)
):
    """Initialize default expense categories"""
    defaults = [
        {"name": "Nómina", "type": "fixed", "color": "#3B82F6"},
        {"name": "Renta", "type": "fixed", "color": "#EF4444"},
        {"name": "Servicios", "type": "fixed", "color": "#F59E0B"},
        {"name": "Transporte", "type": "variable", "color": "#10B981"},
        {"name": "Marketing", "type": "variable", "color": "#8B5CF6"},
        {"name": "Otros", "type": "variable", "color": "#6B7280"},
    ]
    
    created = 0
    for cat_data in defaults:
        existing = db.query(models.ExpenseCategory).filter(
            models.ExpenseCategory.tenant_id == tenant_id,
            models.ExpenseCategory.name == cat_data["name"]
        ).first()
        if not existing:
            category = models.ExpenseCategory(tenant_id=tenant_id, **cat_data)
            db.add(category)
            created += 1
    
    db.commit()
    return {"message": f"Created {created} default categories"}