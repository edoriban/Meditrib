export interface Medicine {
    id: number;
    name: string;
    description?: string;
    sale_price: number;
    purchase_price: number;
    provider: string;
    type: string;
    inventory?: {
        quantity: number;
    };
}