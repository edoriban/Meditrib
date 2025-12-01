from sqlalchemy.orm import Session
from backend.core.models import Expense, ExpenseCategory
from backend.core.schemas import ExpenseCreate, ExpenseUpdate, ExpenseCategoryCreate, ExpenseCategoryUpdate
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import func


def get_expenses(db: Session, skip: int = 0, limit: int = 100) -> List[Expense]:
    return db.query(Expense).offset(skip).limit(limit).all()


def get_expense(db: Session, expense_id: int) -> Optional[Expense]:
    return db.query(Expense).filter(Expense.id == expense_id).first()


def create_expense(db: Session, expense: ExpenseCreate) -> Expense:
    # Calcular IVA si es deducible
    tax_amount = 0.0
    if expense.is_tax_deductible and expense.amount > 0:
        # IVA trasladado (crédito fiscal)
        tax_amount = expense.amount * 0.16

    db_expense = Expense(
        **expense.model_dump(),
        tax_amount=tax_amount
    )

    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def update_expense(db: Session, expense_id: int, expense_update: ExpenseUpdate) -> Optional[Expense]:
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if db_expense:
        update_data = expense_update.model_dump(exclude_unset=True)

        # Recalcular IVA si cambian amount o is_tax_deductible
        if 'amount' in update_data or 'is_tax_deductible' in update_data:
            amount = update_data.get('amount', db_expense.amount)
            is_deductible = update_data.get('is_tax_deductible', db_expense.is_tax_deductible)
            if is_deductible and amount > 0:
                update_data['tax_amount'] = amount * 0.16
            else:
                update_data['tax_amount'] = 0.0

        for key, value in update_data.items():
            setattr(db_expense, key, value)

        db.commit()
        db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int) -> bool:
    db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if db_expense:
        db.delete(db_expense)
        db.commit()
        return True
    return False


# Expense Categories CRUD
def get_expense_categories(db: Session) -> List[ExpenseCategory]:
    return db.query(ExpenseCategory).all()


def get_expense_category(db: Session, category_id: int) -> Optional[ExpenseCategory]:
    return db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()


def create_expense_category(db: Session, category: ExpenseCategoryCreate) -> ExpenseCategory:
    db_category = ExpenseCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_expense_category(db: Session, category_id: int, category_update: ExpenseCategoryUpdate) -> Optional[ExpenseCategory]:
    db_category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if db_category:
        for key, value in category_update.model_dump(exclude_unset=True).items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_expense_category(db: Session, category_id: int) -> bool:
    db_category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if db_category:
        # Check if category has expenses
        expense_count = db.query(Expense).filter(Expense.category_id == category_id).count()
        if expense_count > 0:
            return False  # Cannot delete category with expenses

        db.delete(db_category)
        db.commit()
        return True
    return False


# Reporting functions
def get_expenses_by_date_range(db: Session, start_date: date, end_date: date) -> List[Expense]:
    return db.query(Expense).filter(
        func.date(Expense.expense_date) >= start_date,
        func.date(Expense.expense_date) <= end_date
    ).all()


def get_expenses_by_category(db: Session, category_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None):
    query = db.query(Expense).filter(Expense.category_id == category_id)

    if start_date and end_date:
        query = query.filter(
            func.date(Expense.expense_date) >= start_date,
            func.date(Expense.expense_date) <= end_date
        )

    return query.all()


def get_expense_summary(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None):
    """Obtiene resumen de gastos por categoría y tipo"""
    query = db.query(Expense)

    if start_date and end_date:
        query = query.filter(
            func.date(Expense.expense_date) >= start_date,
            func.date(Expense.expense_date) <= end_date
        )

    expenses = query.all()

    # Calcular totales
    total_expenses = sum(exp.amount for exp in expenses)
    total_tax_deductible = sum(exp.amount for exp in expenses if exp.is_tax_deductible)
    total_tax_amount = sum(exp.tax_amount for exp in expenses)

    # Agrupar por categoría
    categories_summary = {}
    for expense in expenses:
        if expense.category:
            cat_name = expense.category.name
            if cat_name not in categories_summary:
                categories_summary[cat_name] = {
                    'total': 0,
                    'count': 0,
                    'type': expense.category.type,
                    'color': expense.category.color
                }
            categories_summary[cat_name]['total'] += expense.amount
            categories_summary[cat_name]['count'] += 1

    return {
        'total_expenses': total_expenses,
        'total_tax_deductible': total_tax_deductible,
        'total_tax_amount': total_tax_amount,
        'expense_count': len(expenses),
        'categories': categories_summary
    }


def initialize_default_categories(db: Session):
    """Inicializa categorías de gastos por defecto para distribución farmacéutica"""
    default_categories = [
        # Gastos Fijos
        {"name": "Renta", "description": "Alquiler de local/oficina", "type": "fixed", "color": "#ef4444"},
        {"name": "Servicios Básicos", "description": "Luz, agua, teléfono, internet", "type": "fixed", "color": "#f97316"},
        {"name": "Nómina", "description": "Salarios y prestaciones", "type": "fixed", "color": "#eab308"},

        # Gastos Variables - Operativos
        {"name": "Transporte", "description": "Gasolina, mantenimiento vehículo", "type": "variable", "color": "#22c55e"},
        {"name": "Viáticos", "description": "Comidas, hospedaje en viajes", "type": "variable", "color": "#06b6d4"},
        {"name": "Papelería", "description": "Material de oficina, impresiones", "type": "variable", "color": "#8b5cf6"},

        # Gastos Variables - Ventas
        {"name": "Comisiones", "description": "Pagos a vendedores externos", "type": "variable", "color": "#ec4899"},
        {"name": "Muestras Médicas", "description": "Medicamentos de muestra", "type": "variable", "color": "#f43f5e"},
        {"name": "Promoción", "description": "Publicidad, ferias, marketing", "type": "variable", "color": "#84cc16"},

        # Gastos Variables - Logísticos
        {"name": "Almacenamiento", "description": "Bodega, refrigeración", "type": "variable", "color": "#6366f1"},
        {"name": "Embalaje", "description": "Cajas, etiquetas, empaques", "type": "variable", "color": "#14b8a6"},
        {"name": "Seguros", "description": "Pólizas de mercancía", "type": "variable", "color": "#f59e0b"},
    ]

    for cat_data in default_categories:
        # Check if category already exists
        existing = db.query(ExpenseCategory).filter(ExpenseCategory.name == cat_data["name"]).first()
        if not existing:
            category = ExpenseCategory(**cat_data)
            db.add(category)

    db.commit()