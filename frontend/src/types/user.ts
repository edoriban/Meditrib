
import * as z from "zod";
import { UseFormReturn } from "react-hook-form";


export interface User {
    id: number;
    email: string;
    name: string;
    role: {
        id: number;
        name: string;
    };
}

export interface UserEditFormProps {
    form: UseFormReturn<UserFormValues>;
    roles: any[];
}
// Esquema de validación para usuario
export const userFormSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    role_id: z.number().int().positive(),
    password: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
