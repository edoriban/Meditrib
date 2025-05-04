import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { IconPlus, IconCheck, IconX } from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useUserMutations } from "@/hooks/useUserMutations";

// Reglas de validación de contraseña
const passwordRules = {
    minLength: 8,
    hasUppercase: /[A-Z]/,
    hasLowercase: /[a-z]/,
    hasNumber: /[0-9]/,
    hasSpecialChar: /[^A-Za-z0-9]/,
};

// Esquema de validación para crear usuario
const createUserSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Email inválido" }),
    password: z.string()
        .min(passwordRules.minLength, { message: `La contraseña debe tener al menos ${passwordRules.minLength} caracteres` })
        .refine(value => passwordRules.hasUppercase.test(value), {
            message: "La contraseña debe tener al menos una letra mayúscula"
        })
        .refine(value => passwordRules.hasLowercase.test(value), {
            message: "La contraseña debe tener al menos una letra minúscula"
        })
        .refine(value => passwordRules.hasNumber.test(value), {
            message: "La contraseña debe tener al menos un número"
        })
        .refine(value => passwordRules.hasSpecialChar.test(value), {
            message: "La contraseña debe tener al menos un caracter especial"
        }),
    password_confirmation: z.string(),
    role_id: z.number().int().positive(),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;

export function CreateUserDialog() {
    const { createUser } = useUserMutations();
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [passwordValue, setPasswordValue] = React.useState("");

    const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            role_id: 2, // Default to regular user role
        }
    });

    // Vigilar el valor de la contraseña para la validación en tiempo real
    const password = watch("password");
    React.useEffect(() => {
        setPasswordValue(password || "");
    }, [password]);

    // Obtener roles para el selector
    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/roles/`);
            return data;
        },
    });

    // Función que se ejecuta al enviar el formulario
    const onSubmit = async (data: CreateUserFormValues) => {
        setIsSubmitting(true);

        try {
            const { password_confirmation, ...userData } = data;
            await createUser(userData);
            setOpen(false);
            reset(); // Limpiar formulario después de crear
        } finally {
            setIsSubmitting(false);
        }
    };

    // Limpiar formulario cuando se cierra el diálogo
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset();
        }
        setOpen(newOpen);
    };

    // Verificar criterios de la contraseña
    const passwordCriteria = {
        length: passwordValue.length >= passwordRules.minLength,
        uppercase: passwordRules.hasUppercase.test(passwordValue),
        lowercase: passwordRules.hasLowercase.test(passwordValue),
        number: passwordRules.hasNumber.test(passwordValue),
        special: passwordRules.hasSpecialChar.test(passwordValue),
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <IconPlus className="mr-1 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear nuevo usuario</DialogTitle>
                    <DialogDescription>
                        Completa los siguientes campos para crear un nuevo usuario en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormInput
                        name="name"
                        control={control}
                        label="Nombre completo"
                        placeholder="Juan Pérez"
                        errors={errors}
                    />

                    <FormInput
                        name="email"
                        control={control}
                        label="Correo electrónico"
                        placeholder="usuario@ejemplo.com"
                        type="email"
                        errors={errors}
                    />

                    <FormInput
                        name="password"
                        control={control}
                        label="Contraseña"
                        placeholder="••••••••"
                        type="password"
                        errors={errors}
                    />

                    {/* Verificador de criterios de contraseña */}
                    {passwordValue && (
                        <div className="space-y-1 text-sm">
                            <p className="font-medium">La contraseña debe contener:</p>
                            <ul className="space-y-1 pl-2">
                                <PasswordCriteriaItem
                                    isValid={passwordCriteria.length}
                                    text={`Al menos ${passwordRules.minLength} caracteres`}
                                />
                                <PasswordCriteriaItem
                                    isValid={passwordCriteria.uppercase}
                                    text="Al menos una letra mayúscula"
                                />
                                <PasswordCriteriaItem
                                    isValid={passwordCriteria.lowercase}
                                    text="Al menos una letra minúscula"
                                />
                                <PasswordCriteriaItem
                                    isValid={passwordCriteria.number}
                                    text="Al menos un número"
                                />
                                <PasswordCriteriaItem
                                    isValid={passwordCriteria.special}
                                    text="Al menos un carácter especial"
                                />
                            </ul>
                        </div>
                    )}

                    <FormInput
                        name="password_confirmation"
                        control={control}
                        label="Confirmar contraseña"
                        placeholder="••••••••"
                        type="password"
                        errors={errors}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Rol del usuario
                        </label>
                        <Select
                            onValueChange={(value) => setValue("role_id", parseInt(value))}
                            defaultValue="2" // Usuario regular por defecto
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles?.map((role: any) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creando..." : "Crear usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// Componente para mostrar criterios de contraseña
function PasswordCriteriaItem({ isValid, text }: { isValid: boolean; text: string }) {
    return (
        <li className="flex items-center gap-2">
            {isValid ? (
                <IconCheck className="h-4 w-4 text-green-500" />
            ) : (
                <IconX className="h-4 w-4 text-red-500" />
            )}
            <span className={isValid ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>
                {text}
            </span>
        </li>
    );
}