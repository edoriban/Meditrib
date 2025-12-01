import * as z from "zod";

export interface Sale {
    id: number;
    medicine_id: number;
    quantity: number;
    total_price: number;
    client_id: number;
    sale_date: string; // datetime as string
    user_id: number;
    shipping_date?: string; // date as string
    shipping_status: string;
    payment_status: string;
    payment_method?: string;
    medicine: {
        id: number;
        name: string;
    };
    client: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
    };
}

export const saleFormSchema = z.object({
    medicine_id: z.number().int().positive(),
    quantity: z.number().int().positive(),
    total_price: z.number().positive(),
    client_id: z.number().int().positive(),
    sale_date: z.string(), // or date
    user_id: z.number().int().positive(),
    shipping_date: z.string().optional(),
    shipping_status: z.string(),
    payment_status: z.string(),
    payment_method: z.string().optional(),
});

export const saleCreateSchema = saleFormSchema;

export const saleUpdateSchema = saleFormSchema.partial();

export type SaleFormValues = z.infer<typeof saleFormSchema>;

export type SaleCreateValues = z.infer<typeof saleCreateSchema>;

export type SaleUpdateValues = z.infer<typeof saleUpdateSchema>;