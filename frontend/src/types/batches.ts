export interface ProductBatch {
    id: number;
    product_id: number;
    batch_number: string;
    expiration_date: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost?: number;
    supplier_id?: number;
    received_date: string;
    notes?: string;
    product: {
        id: number;
        name: string;
        description?: string;
    };
    supplier?: {
        id: number;
        name: string;
    };
}

export interface BatchStockMovement {
    id: number;
    batch_id: number;
    movement_type: "in" | "out" | "adjustment";
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    reason?: string;
    reference_id?: string;
    movement_date: string;
    user_id: number;
    batch: ProductBatch;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

export interface ExpiringBatch {
    id: number;
    product_name: string;
    batch_number: string;
    expiration_date: string;
    quantity_remaining: number;
    days_until_expiry: number;
}

export interface BatchInventorySummary {
    total_active_batches: number;
    expiring_within_30_days: number;
    total_inventory_value: number;
    products_with_batches: number;
    batch_distribution: Array<{
        product_id: number;
        batch_count: number;
        total_quantity: number;
    }>;
}

export interface BatchValidation {
    valid: boolean;
    status: "not_found" | "expired" | "expiring_soon" | "valid";
    days_until_expiry?: number;
    expiration_date?: string;
}

export interface ProductBatchCreate {
    product_id: number;
    batch_number: string;
    expiration_date: string;
    quantity_received: number;
    quantity_remaining: number;
    unit_cost?: number;
    supplier_id?: number;
    received_date: string;
    notes?: string;
}

export interface ProductBatchUpdate {
    batch_number?: string;
    expiration_date?: string;
    quantity_received?: number;
    quantity_remaining?: number;
    unit_cost?: number;
    supplier_id?: number;
    notes?: string;
}