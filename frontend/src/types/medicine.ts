import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

export interface Medicine {
    id: number;
    name: string;
    description?: string;
    type?: string;
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

export interface MedicineEditFormProps {
    form: UseFormReturn<MedicineFormValues>;
}

export const medicineFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string().optional(),
    sale_price: z.number().positive({ message: "El precio de venta debe ser mayor a 0" }),
    purchase_price: z.number().positive({ message: "El precio de compra debe ser mayor a 0" }).optional(),
    type: z.string().optional(),
    inventory: z
        .object({
            quantity: z.number().int().min(0, { message: "La cantidad no puede ser negativa" }),
        })
        .optional(),
    supplier_id: z.number().int().positive().optional(),
});

export const medicineCreateSchema = medicineFormSchema;

export const medicineUpdateSchema = medicineFormSchema.partial();

export type MedicineFormValues = z.infer<typeof medicineFormSchema>;
export type MedicineCreateValues = z.infer<typeof medicineCreateSchema>;
export type MedicineUpdateValues = z.infer<typeof medicineUpdateSchema>;

