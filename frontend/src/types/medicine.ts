export interface Medicine {
    id: number;
    name: string;
    description?: string;
    type: string;
    sale_price: number;
    purchase_price: number;
    inventory?: {
        quantity: number;
    };
    suppliers?: {
        id: number;
        name: string;
    };
}