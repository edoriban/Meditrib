import * as z from "zod";

export interface Client {
    id: number;
    name: string;
    contact?: string;
    address?: string;
    email?: string;
}

export const clientFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    contact: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
});

export const clientCreateSchema = clientFormSchema;

export const clientUpdateSchema = clientFormSchema.partial();

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export type ClientCreateValues = z.infer<typeof clientCreateSchema>;

export type ClientUpdateValues = z.infer<typeof clientUpdateSchema>;