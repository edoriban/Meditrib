export interface IncomeStatement {
    period: {
        start_date: string;
        end_date: string;
    };
    income: {
        total_sales: number;
        sales_with_iva: number;
        sales_without_iva: number;
        iva_collected: number;
    };
    expenses: {
        total_expenses: number;
        iva_paid: number;
        by_category: {
            [categoryName: string]: {
                total: number;
                count: number;
                type: string;
                color?: string;
            };
        };
    };
    profit: {
        gross_profit: number;
        net_profit: number;
        gross_margin_percentage: number;
        net_margin_percentage: number;
    };
    taxes: {
        iva_balance: number;
        iva_collected: number;
        iva_paid: number;
    };
}

export interface ProductProfitability {
    product_id: number;
    product_name: string;
    total_quantity: number;
    total_sales: number;
    estimated_cost: number;
    profit: number;
    margin_percentage: number;
    average_price: number;
}

export interface MonthlyTrend {
    month: string;
    month_name: string;
    sales: number;
    expenses: number;
    profit: number;
}

export interface FinancialSummary {
    current_month: IncomeStatement;
    last_month: IncomeStatement;
    changes: {
        sales_percentage: number;
        expenses_percentage: number;
        profit_percentage: number;
    };
    summary: {
        total_revenue: number;
        total_expenses: number;
        net_profit: number;
        profit_margin: number;
        iva_balance: number;
    };
}