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

const registerFormSchema = z.object({
    username: z.string({
        required_error: "El nombre de usuario es obligatorio",
    }).min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." }),

    email: z.string({
        required_error: "El correo electrónico es obligatorio",
    }).email({ message: "Por favor, introduce un correo electrónico válido." }),

    full_name: z.string().optional(),

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
    username: "",
    email: "",
    full_name: "",
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

    // TODO: Implementar la lógica de envío (onSubmit) más adelante
    // Esta función se llamará solo si la validación es exitosa
    function onSubmit(data: RegisterFormValues) {
        console.log("Datos del formulario válidos:", data)
        // Aquí llamarías a tu API para registrar al usuario
        // Ejemplo:
        // fetch('/api/users/', { method: 'POST', body: JSON.stringify(data), ... })
        //   .then(...)
        //   .catch(...)
        toast("Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.")
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
                                name="username"
                                control={control}
                                errors={errors}
                                label="Nombre de usuario"
                                placeholder="tu_usuario"
                                required
                            />

                            <FormInput
                                name="full_name"
                                control={control}
                                errors={errors}
                                label="Nombre completo (Opcional)"
                                placeholder="Tu Nombre Completo"
                            />

                            <FormInput
                                name="email"
                                control={control}
                                errors={errors}
                                label="Correo electrónico"
                                placeholder="m@example.com"
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