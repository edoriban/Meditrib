export interface DashboardComparison {
    timeframe: "7d" | "30d";
    current: {
        sales: number;
        expenses: number;
        profit: number;
    };
    previous: {
        sales: number;
        expenses: number;
        profit: number;
    };
    variations: {
        sales: number;
        expenses: number;
        profit: number;
    };
}

export interface FulfillmentStats {
    pending_delivery: number;
    shipped_but_not_delivered: number;
    pending_payment: number;
    expiring_soon: number;
}

export interface TopProduct {
    id: number;
    name: string;
    total_sold: number;
    total_revenue: number;
    sale_price: number;
}
