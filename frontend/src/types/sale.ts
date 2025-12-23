export interface Sale {
    id: number;
    product_id: number;
    quantity: number;
    subtotal: number;
    client_id: number;
    sale_date: string;
    user_id: number;
    document_type: 'invoice' | 'remission';
    iva_rate: number;
    iva_amount: number;
    total_with_iva: number;
    total_price: number; // Para compatibilidad
    shipping_date?: string;
    shipping_status: string;
    payment_status: string;
    payment_method?: string;
    invoice_id?: number;
    product: {
        id: number;
        name: string;
        sale_price: number;
    };
    client: {
        id: number;
        name: string;
        rfc?: string;
    };
    user: {
        id: number;
        name: string;
    };
    invoice?: {
        id: number;
        uuid?: string;
        status: string;
    };
}

export interface SaleCreate {
    product_id: number;
    quantity: number;
    subtotal: number;
    client_id: number;
    sale_date: string;
    user_id: number;
    document_type?: 'invoice' | 'remission';
    iva_rate?: number;
    shipping_date?: string;
    shipping_status?: string;
    payment_status?: string;
    payment_method?: string;
}

export interface SaleUpdate {
    product_id?: number;
    quantity?: number;
    subtotal?: number;
    client_id?: number;
    sale_date?: string;
    user_id?: number;
    document_type?: 'invoice' | 'remission';
    iva_rate?: number;
    shipping_date?: string;
    shipping_status?: string;
    payment_status?: string;
    payment_method?: string;
}