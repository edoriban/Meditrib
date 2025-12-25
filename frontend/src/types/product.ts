import { z } from "zod";
import { UseFormReturn } from "react-hook-form";

export interface Product {
    id: number;
    name: string;
    description?: string;
    tags?: ProductTag[];
    type?: string; // Campo legacy para compatibilidad con DataTable
    sale_price: number;
    purchase_price: number;
    expiration_date?: string;
    batch_number?: string;
    barcode?: string;
    laboratory?: string;
    concentration?: string;
    prescription_required: boolean;
    iva_rate: number; // 0.0 = exento (productos), 0.16 = 16% (material de curación)
    sat_key?: string; // Clave SAT para facturación electrónica
    image_path?: string; // Ruta de la imagen del producto
    active_substance?: string; // Sustancia activa del producto
    inventory?: {
        quantity: number;
    };
    suppliers?: {
        id: number;
        name: string;
    };
}

export interface ProductEditFormProps {
    form: UseFormReturn<ProductFormValues>;
}

export const productFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string().nullish(),
    sale_price: z.number().positive({ message: "El precio de venta debe ser mayor a 0" }),
    purchase_price: z.number().positive({ message: "El precio de compra debe ser mayor a 0" }).optional(),
    expiration_date: z.string().nullish(),
    batch_number: z.string().nullish(),
    barcode: z.string().nullish(),
    // Pharmacy-specific fields - optional for other verticals (hardware stores, etc.)
    laboratory: z.string().nullish(),
    concentration: z.string().nullish(),
    prescription_required: z.boolean().default(false),
    active_substance: z.string().nullish(), // Optional: pharmacy-specific
    // Tax and billing fields
    iva_rate: z.number().min(0).max(1).default(0),
    sat_key: z.string().nullish(),
    image_path: z.string().nullish(),
    tags: z.array(z.number()).default([]),
    inventory: z
        .object({
            quantity: z.number().int().min(0, { message: "La cantidad no puede ser negativa" }),
        })
        .optional(),
    supplier_id: z.number().int().positive().optional(),
});

export const productCreateSchema = productFormSchema;

export const productUpdateSchema = productFormSchema.partial();

// Infer types from schemas to ensure consistency
export type ProductFormValues = z.infer<typeof productFormSchema>;
export type ProductCreateValues = z.infer<typeof productCreateSchema>;
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>;

export const productTagSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string().optional(),
    color: z.string().optional(),
});

export interface ProductTag {
    id: number;
    name: string;
    description?: string;
    color?: string;
}

export interface ProductTagWithUIState extends ProductTag {
    pendingDelete?: boolean;
}

export interface CreateProductTagDialogProps {
    onClose?: () => void;
}

export type ProductTagFormValues = z.infer<typeof productTagSchema>;

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
    product_id: number | null;
    price_range: string;
    price_difference: PriceDifference | null;
}

export interface ExcelImportPreviewResponse {
    items: ExcelImportPreviewItem[];
    total_items: number;
    new_products: number;
    existing_products: number;
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
    product_id: number | null;
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

// ============================================================================
// TIPOS PARA PAGINACIÓN
// ============================================================================

export interface ProductPaginatedResponse {
    items: Product[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}