import * as z from "zod";

export interface PurchaseOrderItem {
    purchase_order_id: number;
    medicine_id: number;
    quantity: number;
    unit_price: number;
    medicine: {
        id: number;
        name: string;
    };
}

export interface PurchaseOrder {
    id: number;
    supplier_id: number;
    order_date: string; // date as string
    expected_delivery_date?: string;
    status: string;
    total_amount?: number;
    items: PurchaseOrderItem[];
    created_by: number;
    supplier: {
        id: number;
        name: string;
    };
}

export const purchaseOrderFormSchema = z.object({
    supplier_id: z.number().int().positive(),
    order_date: z.string(),
    expected_delivery_date: z.string().optional(),
    status: z.string(),
    total_amount: z.number().positive().optional(),
    items: z.array(z.object({
        medicine_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive(),
    })),
    created_by: z.number().int().positive(),
});

export const purchaseOrderCreateSchema = purchaseOrderFormSchema;

export const purchaseOrderUpdateSchema = purchaseOrderFormSchema.partial();

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;

export type PurchaseOrderCreateValues = z.infer<typeof purchaseOrderCreateSchema>;

export type PurchaseOrderUpdateValues = z.infer<typeof purchaseOrderUpdateSchema>;