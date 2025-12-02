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
    sat_key?: string; // Clave SAT para facturación electrónica
    image_path?: string; // Ruta de la imagen del medicamento
    active_substance?: string; // Sustancia activa del medicamento
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
    sat_key: z.string().optional(), // Clave SAT para facturación
    image_path: z.string().optional(), // Ruta de imagen
    active_substance: z.string().optional(), // Sustancia activa
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
    sat_key?: string;
    image_path?: string;
    active_substance?: string;
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
    sat_key?: string;
    image_path?: string;
    active_substance?: string;
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

// ============================================================================
// TIPOS PARA IMPORTACIÓN DE EXCEL
// ============================================================================

export interface PriceDifference {
    direction: "up" | "down" | "same";
    percentage: number;
    absolute: number;
}

export interface ExcelImportPreviewItem {
    barcode: string;
    name: string;
    active_substance?: string | null;
    laboratory?: string | null;
    purchase_price_new: number;
    purchase_price_old: number | null;
    sale_price_suggested: number;
    sale_price_current: number | null;
    price_change: "up" | "down" | "same" | "new";
    iva_rate: number;
    inventory_to_add: number;
    exists: boolean;
    medicine_id: number | null;
    price_range: string;
    price_difference: PriceDifference | null;
}

export interface ExcelImportPreviewResponse {
    items: ExcelImportPreviewItem[];
    total_items: number;
    new_medicines: number;
    existing_medicines: number;
    price_changes: number;
}

export interface ExcelImportConfirmItem {
    barcode: string;
    name: string;
    active_substance?: string | null;
    laboratory?: string | null;
    purchase_price: number;
    sale_price: number;
    iva_rate: number;
    inventory_to_add: number;
    exists: boolean;
    medicine_id: number | null;
    sat_key?: string | null;
}

export interface ExcelImportError {
    barcode: string;
    error: string;
}

export interface ExcelImportConfirmResponse {
    created: number;
    updated: number;
    errors: ExcelImportError[];
    total_processed: number;
}