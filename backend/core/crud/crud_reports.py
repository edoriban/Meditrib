from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from backend.core.models import Sale, Expense, ExpenseCategory


def get_income_statement(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict:
    """
    Genera estado de resultados (Income Statement)
    Ingresos - Gastos = Utilidad
    """
    # Si no se especifican fechas, usar el mes actual
    if not start_date or not end_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
        end_date = date(today.year, today.month + 1, 1) if today.month < 12 else date(today.year + 1, 1, 1)

    # Calcular ingresos
    sales_query = db.query(Sale).filter(
        func.date(Sale.sale_date) >= start_date,
        func.date(Sale.sale_date) <= end_date
    )

    total_sales = 0
    total_iva_collected = 0
    sales_by_type = {"invoice": 0, "remission": 0}

    for sale in sales_query.all():
        sales_by_type[sale.document_type] += sale.total_with_iva
        total_sales += sale.total_with_iva
        total_iva_collected += sale.iva_amount

    # Calcular gastos
    expenses_query = db.query(Expense).filter(
        func.date(Expense.expense_date) >= start_date,
        func.date(Expense.expense_date) <= end_date
    )

    total_expenses = 0
    total_iva_paid = 0
    expenses_by_category = {}

    for expense in expenses_query.all():
        total_expenses += expense.amount
        total_iva_paid += expense.tax_amount

        category_name = expense.category.name
        if category_name not in expenses_by_category:
            expenses_by_category[category_name] = {
                "total": 0,
                "type": expense.category.type,
                "count": 0
            }
        expenses_by_category[category_name]["total"] += expense.amount
        expenses_by_category[category_name]["count"] += 1

    # Calcular utilidad
    gross_profit = total_sales - total_expenses
    net_profit = gross_profit

    # Calcular márgenes
    gross_margin = (gross_profit / total_sales * 100) if total_sales > 0 else 0
    net_margin = (net_profit / total_sales * 100) if total_sales > 0 else 0

    return {
        "period": {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        },
        "income": {
            "total_sales": total_sales,
            "sales_with_iva": sales_by_type["invoice"],
            "sales_without_iva": sales_by_type["remission"],
            "iva_collected": total_iva_collected
        },
        "expenses": {
            "total_expenses": total_expenses,
            "iva_paid": total_iva_paid,
            "by_category": expenses_by_category
        },
        "profit": {
            "gross_profit": gross_profit,
            "net_profit": net_profit,
            "gross_margin_percentage": round(gross_margin, 2),
            "net_margin_percentage": round(net_margin, 2)
        },
        "taxes": {
            "iva_balance": total_iva_collected - total_iva_paid,  # IVA a favor o a cargo
            "iva_collected": total_iva_collected,
            "iva_paid": total_iva_paid
        }
    }


def get_product_profitability(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Dict]:
    """
    Análisis de rentabilidad por producto
    """
    if not start_date or not end_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
        end_date = date(today.year, today.month + 1, 1) if today.month < 12 else date(today.year + 1, 1, 1)

    # Obtener ventas por medicamento
    sales_query = db.query(
        Sale.medicine_id,
        Sale.medicine,
        func.sum(Sale.quantity).label('total_quantity'),
        func.sum(Sale.subtotal).label('total_subtotal'),
        func.sum(Sale.iva_amount).label('total_iva'),
        func.sum(Sale.total_with_iva).label('total_sales')
    ).filter(
        func.date(Sale.sale_date) >= start_date,
        func.date(Sale.sale_date) <= end_date
    ).group_by(Sale.medicine_id, Sale.medicine)

    products = []
    for row in sales_query.all():
        medicine = row.medicine
        total_quantity = row.total_quantity or 0
        total_subtotal = row.total_subtotal or 0
        total_sales = row.total_sales or 0

        # Calcular costo estimado (purchase_price * quantity)
        estimated_cost = medicine.purchase_price * total_quantity if medicine.purchase_price else 0
        profit = total_subtotal - estimated_cost
        margin = (profit / total_subtotal * 100) if total_subtotal > 0 else 0

        products.append({
            "medicine_id": row.medicine_id,
            "medicine_name": medicine.name,
            "total_quantity": total_quantity,
            "total_sales": total_sales,
            "estimated_cost": estimated_cost,
            "profit": profit,
            "margin_percentage": round(margin, 2),
            "average_price": total_sales / total_quantity if total_quantity > 0 else 0
        })

    # Ordenar por rentabilidad
    return sorted(products, key=lambda x: x["profit"], reverse=True)


def get_monthly_trend(db: Session, months: int = 6) -> List[Dict]:
    """
    Tendencia mensual de ingresos y gastos
    """
    today = date.today()
    start_date = date(today.year, today.month - months + 1, 1) if today.month > months else date(today.year - 1, 12 - (months - today.month), 1)

    monthly_data = []

    for i in range(months):
        month_start = date(start_date.year, start_date.month + i, 1)
        if start_date.month + i > 12:
            month_start = date(start_date.year + 1, (start_date.month + i) - 12, 1)

        month_end = date(month_start.year, month_start.month + 1, 1) if month_start.month < 12 else date(month_start.year + 1, 1, 1)

        # Ingresos del mes
        monthly_sales = db.query(func.sum(Sale.total_with_iva)).filter(
            func.date(Sale.sale_date) >= month_start,
            func.date(Sale.sale_date) < month_end
        ).scalar() or 0

        # Gastos del mes
        monthly_expenses = db.query(func.sum(Expense.amount)).filter(
            func.date(Expense.expense_date) >= month_start,
            func.date(Expense.expense_date) < month_end
        ).scalar() or 0

        monthly_data.append({
            "month": month_start.strftime("%Y-%m"),
            "month_name": month_start.strftime("%B %Y"),
            "sales": monthly_sales,
            "expenses": monthly_expenses,
            "profit": monthly_sales - monthly_expenses
        })

    return monthly_data


def get_daily_sales_trend(db: Session, days: int = 90) -> List[Dict]:
    """
    Tendencia diaria de ventas y costos para la gráfica interactiva
    """
    from backend.core.models import PurchaseOrder
    
    today = date.today()
    start_date = today - timedelta(days=days)
    
    daily_data = []
    
    current_date = start_date
    while current_date <= today:
        # Ventas del día (total_with_iva)
        daily_sales = db.query(func.sum(Sale.total_with_iva)).filter(
            func.date(Sale.sale_date) == current_date
        ).scalar() or 0
        
        # Costos del día (compras/órdenes de compra)
        daily_costs = db.query(func.sum(PurchaseOrder.total_amount)).filter(
            func.date(PurchaseOrder.created_at) == current_date
        ).scalar() or 0
        
        # También incluir gastos del día
        daily_expenses = db.query(func.sum(Expense.amount)).filter(
            func.date(Expense.expense_date) == current_date
        ).scalar() or 0
        
        daily_data.append({
            "date": current_date.isoformat(),
            "venta": float(daily_sales),
            "compra": float(daily_costs + daily_expenses)
        })
        
        current_date += timedelta(days=1)
    
    return daily_data


def get_financial_summary(db: Session) -> Dict:
    """
    Resumen financiero general
    """
    # Mes actual
    current_month = get_income_statement(db)

    # Mes anterior
    today = date.today()
    last_month_start = date(today.year, today.month - 1, 1) if today.month > 1 else date(today.year - 1, 12, 1)
    last_month_end = date(today.year, today.month, 1)
    last_month = get_income_statement(db, last_month_start, last_month_end)

    # Calcular variaciones
    sales_change = ((current_month["income"]["total_sales"] - last_month["income"]["total_sales"]) /
                   last_month["income"]["total_sales"] * 100) if last_month["income"]["total_sales"] > 0 else 0

    expenses_change = ((current_month["expenses"]["total_expenses"] - last_month["expenses"]["total_expenses"]) /
                      last_month["expenses"]["total_expenses"] * 100) if last_month["expenses"]["total_expenses"] > 0 else 0

    profit_change = ((current_month["profit"]["net_profit"] - last_month["profit"]["net_profit"]) /
                    abs(last_month["profit"]["net_profit"]) * 100) if last_month["profit"]["net_profit"] != 0 else 0

    return {
        "current_month": current_month,
        "last_month": last_month,
        "changes": {
            "sales_percentage": round(sales_change, 2),
            "expenses_percentage": round(expenses_change, 2),
            "profit_percentage": round(profit_change, 2)
        },
        "summary": {
            "total_revenue": current_month["income"]["total_sales"],
            "total_expenses": current_month["expenses"]["total_expenses"],
            "net_profit": current_month["profit"]["net_profit"],
            "profit_margin": current_month["profit"]["net_margin_percentage"],
            "iva_balance": current_month["taxes"]["iva_balance"]
        }
    }