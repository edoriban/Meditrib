import * as z from "zod";

// Regex para validar RFC mexicano (persona física: 13 caracteres, persona moral: 12 caracteres)
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;

// Regex para código postal mexicano (5 dígitos)
const postalCodeRegex = /^\d{5}$/;

export interface Client {
    id: number;
    name: string;
    contact?: string;
    address?: string;
    email?: string;
    rfc?: string;
    tax_regime?: string;
    cfdi_use?: string;
    fiscal_street?: string;
    fiscal_exterior_number?: string;
    fiscal_interior_number?: string;
    fiscal_neighborhood?: string;
    fiscal_city?: string;
    fiscal_state?: string;
    fiscal_postal_code?: string;
    fiscal_country?: string;
}

// Validación de RFC mexicano (opcional pero válido si se proporciona)
const rfcSchema = z.string()
    .transform(val => val.toUpperCase().trim())
    .refine(
        (val) => val === "" || rfcRegex.test(val),
        { message: "RFC inválido. Formato esperado: XXXX000000XXX (persona moral) o XXX000000XXX (persona física)" }
    )
    .optional()
    .or(z.literal(""));

// Validación de código postal mexicano (5 dígitos)
const postalCodeSchema = z.string()
    .refine(
        (val) => val === "" || postalCodeRegex.test(val),
        { message: "Código postal debe ser de 5 dígitos" }
    )
    .optional()
    .or(z.literal(""));

export const clientFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    contact: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
    rfc: rfcSchema,
    tax_regime: z.string().optional(),
    cfdi_use: z.string().optional(),
    fiscal_street: z.string().optional(),
    fiscal_exterior_number: z.string().optional(),
    fiscal_interior_number: z.string().optional(),
    fiscal_neighborhood: z.string().optional(),
    fiscal_city: z.string().optional(),
    fiscal_state: z.string().optional(),
    fiscal_postal_code: postalCodeSchema,
    fiscal_country: z.string().optional(),
});

// Schema para validar datos fiscales completos (requerido para facturación CFDI)
export const clientFiscalValidationSchema = z.object({
    rfc: z.string()
        .min(12, { message: "RFC requerido para facturación" })
        .regex(rfcRegex, { message: "RFC inválido" }),
    tax_regime: z.string().min(1, { message: "Régimen fiscal requerido" }),
    cfdi_use: z.string().min(1, { message: "Uso de CFDI requerido" }),
    fiscal_street: z.string().min(1, { message: "Calle fiscal requerida" }),
    fiscal_postal_code: z.string().regex(postalCodeRegex, { message: "Código postal requerido (5 dígitos)" }),
});

export const clientCreateSchema = clientFormSchema;

export const clientUpdateSchema = clientFormSchema.partial();

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export type ClientCreateValues = z.infer<typeof clientCreateSchema>;

export type ClientUpdateValues = z.infer<typeof clientUpdateSchema>;

// Función helper para validar si un cliente puede facturar
export function canClientInvoice(client: Client): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!client.rfc || client.rfc.length < 12) {
        errors.push("RFC inválido o faltante");
    } else if (!rfcRegex.test(client.rfc)) {
        errors.push("Formato de RFC inválido");
    }

    if (!client.tax_regime) {
        errors.push("Régimen fiscal faltante");
    }

    if (!client.cfdi_use) {
        errors.push("Uso de CFDI faltante");
    }

    if (!client.fiscal_street) {
        errors.push("Calle fiscal faltante");
    }

    if (!client.fiscal_postal_code) {
        errors.push("Código postal fiscal faltante");
    } else if (!postalCodeRegex.test(client.fiscal_postal_code)) {
        errors.push("Código postal debe ser de 5 dígitos");
    }

    return { valid: errors.length === 0, errors };
}