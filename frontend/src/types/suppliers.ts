import * as z from "zod";

export interface Supplier {
    id: number;
    name: string;
    contact_info?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export const supplierFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    contact_info: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
    phone: z.string().optional(),
    address: z.string().optional(),
});

export const supplierCreateSchema = supplierFormSchema;

export const supplierUpdateSchema = supplierFormSchema.partial();

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;

export type SupplierCreateValues = z.infer<typeof supplierCreateSchema>;

export type SupplierUpdateValues = z.infer<typeof supplierUpdateSchema>;