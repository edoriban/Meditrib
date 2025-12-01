import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

export interface Medicine {
    id: number;
    name: string;
    description?: string;
    tags?: MedicineTag[];
    type?: string; // Campo legacy para compatibilidad con DataTable
    sale_price: number;
    purchase_price: number;
    expiration_date?: string;
    batch_number?: string;
    barcode?: string;
    laboratory?: string;
    concentration?: string;
    prescription_required: boolean;
    iva_rate: number; // 0.0 = exento (medicamentos), 0.16 = 16% (material de curación)
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
    expiration_date: z.string().optional(),
    batch_number: z.string().optional(),
    barcode: z.string().optional(),
    laboratory: z.string().optional(),
    concentration: z.string().optional(),
    prescription_required: z.boolean(),
    iva_rate: z.number().min(0).max(1).default(0), // 0 = exento, 0.16 = 16%
    tags: z.array(z.number()).default([]),
    inventory: z
        .object({
            quantity: z.number().int().min(0, { message: "La cantidad no puede ser negativa" }),
        })
        .optional(),
    supplier_id: z.number().int().positive().optional(),
});

export const medicineCreateSchema = medicineFormSchema;

export const medicineUpdateSchema = medicineFormSchema.partial();

export interface MedicineFormValues {
    name: string;
    sale_price: number;
    description?: string;
    purchase_price?: number;
    expiration_date?: string;
    batch_number?: string;
    barcode?: string;
    laboratory?: string;
    concentration?: string;
    prescription_required: boolean;
    iva_rate?: number;
    tags?: number[];
    inventory?: {
        quantity: number;
    };
    supplier_id?: number;
}

export type MedicineCreateValues = {
    name: string;
    sale_price: number;
    description?: string;
    purchase_price?: number;
    expiration_date?: string;
    batch_number?: string;
    barcode?: string;
    laboratory?: string;
    concentration?: string;
    prescription_required: boolean;
    iva_rate?: number;
    tags?: number[];
    inventory?: {
        quantity: number;
    };
    supplier_id?: number;
};

export type MedicineUpdateValues = z.infer<typeof medicineUpdateSchema>;

export const medicineTagSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string().optional(),
    color: z.string().optional(),
});

export interface MedicineTag {
    id: number;
    name: string;
    description?: string;
    color?: string;
}

export interface MedicineTagWithUIState extends MedicineTag {
    pendingDelete?: boolean;
}

export interface CreateMedicineTagDialogProps {
    onClose?: () => void;
}

export type MedicineTagFormValues = z.infer<typeof medicineTagSchema>;