export interface ExpenseCategory {
    id: number;
    name: string;
    description?: string;
    type: 'fixed' | 'variable';
    color?: string;
}

export interface Expense {
    id: number;
    description: string;
    amount: number;
    expense_date: string;
    category_id: number;
    payment_method?: string;
    supplier?: string;
    invoice_number?: string;
    is_tax_deductible: boolean;
    tax_amount: number;
    notes?: string;
    created_by: number;
    category: ExpenseCategory;
    user: {
        id: number;
        name: string;
    };
}

export interface ExpenseCreate {
    description: string;
    amount: number;
    expense_date: string;
    category_id: number;
    payment_method?: string;
    supplier?: string;
    invoice_number?: string;
    is_tax_deductible?: boolean;
    notes?: string;
    created_by: number;
}

export interface ExpenseUpdate {
    description?: string;
    amount?: number;
    expense_date?: string;
    category_id?: number;
    payment_method?: string;
    supplier?: string;
    invoice_number?: string;
    is_tax_deductible?: boolean;
    notes?: string;
}

export interface ExpenseCategoryCreate {
    name: string;
    description?: string;
    type?: 'fixed' | 'variable';
    color?: string;
}

export interface ExpenseCategoryUpdate {
    name?: string;
    description?: string;
    type?: 'fixed' | 'variable';
    color?: string;
}

export interface ExpenseSummary {
    total_expenses: number;
    total_tax_deductible: number;
    total_tax_amount: number;
    expense_count: number;
    categories: {
        [categoryName: string]: {
            total: number;
            count: number;
            type: string;
            color?: string;
        };
    };
}