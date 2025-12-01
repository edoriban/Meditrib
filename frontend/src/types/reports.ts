import * as z from "zod";

export interface Report {
    id: number;
    report_type: string;
    date: string; // datetime as string
    data: string; // or object, but string for now
    generated_by: number;
    user: {
        id: number;
        name: string;
    };
}

export const reportFormSchema = z.object({
    report_type: z.string(),
    date: z.string(),
    data: z.string(),
    generated_by: z.number().int().positive(),
});

export const reportCreateSchema = reportFormSchema;

export const reportUpdateSchema = reportFormSchema.partial();

export type ReportFormValues = z.infer<typeof reportFormSchema>;

export type ReportCreateValues = z.infer<typeof reportCreateSchema>;

export type ReportUpdateValues = z.infer<typeof reportUpdateSchema>;