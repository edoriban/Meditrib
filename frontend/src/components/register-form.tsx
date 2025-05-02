"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { FormInput } from "@/components/ui/form-input"
import { toast } from "sonner"
import { BASE_API_URL } from '@/config';

const registerFormSchema = z.object({
    email: z.string({
        required_error: "El correo electrónico es obligatorio",
    }).email({ message: "Por favor, introduce un correo electrónico válido." }),

    name: z.string().optional(),

    password: z.string({
        required_error: "La contraseña es obligatoria",
    }).min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),

    confirmPassword: z.string({
        required_error: "Por favor, confirma tu contraseña",
    })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerFormSchema>

// Valores por defecto para el formulario
const defaultValues: Partial<RegisterFormValues> = {
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
}

export function RegisterForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { register, handleSubmit, control, formState: { errors }, watch } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues,
        mode: "onSubmit",
    })

    async function onSubmit(data: RegisterFormValues) {
        console.log("Datos del formulario válidos:", data);

        try {
            const userData = {
                email: data.email,
                password: data.password,
                name: data.name || undefined
            };

            console.log("Datos del usuario:", JSON.stringify(userData));

            const response = await fetch(`${BASE_API_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();

                if (response.status === 400 && errorData.detail.includes("Email already registered")) {
                    toast.error("Este correo electrónico ya está registrado. Por favor, usa otro o intenta iniciar sesión.");
                    return;
                }

                throw new Error(errorData.detail || 'Error al registrar el usuario');
            }
            const result = await response.json();
            console.log("Usuario creado:", result);

            toast("Registro exitoso. Por favor, inicia sesión con tus credenciales.");

            window.location.href = '/Login';

        } catch (error) {
            console.error("Error al registrar:", error);
            toast(`Error: ${error instanceof Error ? error.message : 'Ha ocurrido un problema al registrar el usuario'}`);
        }
    }
    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Crear una cuenta</CardTitle>
                    <CardDescription>
                        Introduce tus datos para registrarte
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4">
                            <FormInput
                                name="name"
                                control={control}
                                errors={errors}
                                label="Nombre"
                                placeholder="Tu nombre"
                                required
                            />

                            <FormInput
                                name="email"
                                control={control}
                                errors={errors}
                                label="Correo electrónico"
                                placeholder="correo@meditrib.com"
                                type="email"
                                required
                            />

                            <FormInput
                                name="password"
                                control={control}
                                errors={errors}
                                label="Contraseña"
                                type="password"
                                required
                            />

                            <FormInput
                                name="confirmPassword"
                                control={control}
                                errors={errors}
                                label="Confirmar Contraseña"
                                type="password"
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full mt-2"
                            >
                                Crear cuenta
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <a href="/Login" className="underline underline-offset-4">
                                Inicia sesión
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                Al hacer clic en continuar, aceptas nuestros <a href="#">Términos de Servicio</a>{" "}
                y <a href="#">Política de Privacidad</a>.
            </div>
        </div>
    )
}