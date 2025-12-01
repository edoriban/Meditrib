import * as z from "zod";

// Item individual de una venta
export interface SaleItem {
    id: number;
    sale_id: number;
    medicine_id: number;
    quantity: number;
    unit_price: number;
    discount: number;
    iva_rate: number;
    iva_amount: number;
    subtotal: number;
    medicine: {
        id: number;
        name: string;
        sale_price: number;
        iva_rate: number;
    };
}

// Venta principal con múltiples items
export interface Sale {
    id: number;
    client_id: number;
    user_id: number;
    sale_date: string;
    shipping_date?: string;
    shipping_status: string;
    payment_status: string;
    payment_method?: string;
    document_type: string;
    iva_rate: number;
    subtotal: number;
    iva_amount: number;
    total: number;
    notes?: string;
    items: SaleItem[];
    client: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

// Schema para crear un item de venta
export const saleItemSchema = z.object({
    medicine_id: z.number().int().positive("Selecciona un medicamento"),
    quantity: z.number().int().positive("La cantidad debe ser mayor a 0"),
    unit_price: z.number().positive("El precio debe ser mayor a 0"),
    discount: z.number().min(0).default(0),
});

// Schema para crear una venta
export const saleFormSchema = z.object({
    client_id: z.number().int().positive("Selecciona un cliente"),
    user_id: z.number().int().positive(),
    document_type: z.enum(["invoice", "remission"]).default("invoice"),
    iva_rate: z.number().min(0).max(1).default(0.16),
    shipping_status: z.string().default("pending"),
    payment_status: z.string().default("pending"),
    payment_method: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(saleItemSchema).min(1, "Agrega al menos un medicamento"),
});

export const saleCreateSchema = saleFormSchema;

export const saleUpdateSchema = saleFormSchema.partial();

export type SaleItemValues = z.infer<typeof saleItemSchema>;

export type SaleFormValues = z.infer<typeof saleFormSchema>;

export type SaleCreateValues = z.infer<typeof saleCreateSchema>;

export type SaleUpdateValues = z.infer<typeof saleUpdateSchema>;