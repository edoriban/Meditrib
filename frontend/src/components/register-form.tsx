"use client"

import * as React from "react"
import { useState } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle, IconLoader2, IconCheck } from "@tabler/icons-react"

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
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { handleSubmit, control, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues,
        mode: "onSubmit",
    })

    async function onSubmit(data: RegisterFormValues) {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const userData = {
                email: data.email,
                password: data.password,
                name: data.name || undefined
            };

            const response = await fetch(`${BASE_API_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    if (responseData.detail?.includes("Email already registered")) {
                        setErrorMessage("Este correo electrónico ya está registrado. ¿Quieres iniciar sesión?");
                    } else {
                        setErrorMessage(responseData.detail || "Error en los datos proporcionados.");
                    }
                } else if (response.status === 422) {
                    setErrorMessage("Por favor, verifica que todos los campos estén correctos.");
                } else {
                    setErrorMessage(responseData.detail || 'Error al registrar. Intenta de nuevo.');
                }
                return;
            }

            setSuccessMessage("¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...");
            toast.success("¡Registro exitoso!");

            // Esperar un momento para que el usuario vea el mensaje
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);

        } catch (error) {
            console.error("Error al registrar:", error);
            setErrorMessage('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
        } finally {
            setIsLoading(false);
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
                            {/* Mensaje de error */}
                            {errorMessage && (
                                <Alert variant="destructive">
                                    <IconAlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {errorMessage}
                                        {errorMessage.includes("iniciar sesión") && (
                                            <a href="/login" className="ml-1 underline font-medium">
                                                Ir a iniciar sesión
                                            </a>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Mensaje de éxito */}
                            {successMessage && (
                                <Alert className="border-green-200 bg-green-50 text-green-800">
                                    <IconCheck className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-700">
                                        {successMessage}
                                    </AlertDescription>
                                </Alert>
                            )}

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
                                disabled={isLoading || !!successMessage}
                            >
                                {isLoading ? (
                                    <>
                                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creando cuenta...
                                    </>
                                ) : successMessage ? (
                                    <>
                                        <IconCheck className="mr-2 h-4 w-4" />
                                        ¡Cuenta creada!
                                    </>
                                ) : (
                                    'Crear cuenta'
                                )}
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            ¿Ya tienes una cuenta?{" "}
                            <a href="/login" className="underline underline-offset-4">
                                Inicia sesión
                            </a>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                Al hacer clic en continuar, aceptas nuestros <a href="/terms">Términos de Servicio</a>{" "}
                y <a href="/privacy">Política de Privacidad</a>.
            </div>
        </div>
    )
}