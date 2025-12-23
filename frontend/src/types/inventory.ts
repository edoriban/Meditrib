export interface Inventory {
    product_id: number;
    quantity: number;
    batch?: string;
    expiry_date?: string;
}
