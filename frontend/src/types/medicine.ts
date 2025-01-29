export interface Medicine {
    id: number;
    name: string;
    sale_price: number;
    inventory?: {
        quantity: number;
    };
}