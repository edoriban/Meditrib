import { z } from 'zod';

// Esquema de validación para crear/editar roles
export const roleSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    description: z.string().optional(),
});

// Interfaces y tipos
export interface Role {
    id: number;
    name: string;
    description?: string;
    usersCount?: number;
}

// Extraemos el tipo del esquema de Zod
export type RoleFormValues = z.infer<typeof roleSchema>;

export interface RoleWithUIState extends Role {
    pendingDelete?: boolean;
}

export interface CreateRoleDialogProps {
    onRoleCreated?: (role: Role) => void;
}