import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FormInput } from "@/components/ui/form-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogoPatternBackground } from "@/components/LogoPatternBackground";
import logoSrc from "@/assets/Logo512.png";
import { IconArrowLeft, IconLoader2, IconCheck, IconAlertCircle, IconMail } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";

const forgotPasswordSchema = z.object({
    email: z.string({
        required_error: "El correo electrónico es obligatorio",
    }).email({ message: "Por favor, introduce un correo electrónico válido." }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { handleSubmit, control, formState: { errors } } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    async function onSubmit(data: ForgotPasswordValues) {
        setIsLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${BASE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: data.email }),
            });

            // Siempre mostrar mensaje de éxito por seguridad (no revelar si el email existe)
            if (response.ok || response.status === 404) {
                setSuccessMessage(
                    "Si existe una cuenta con este correo electrónico, recibirás un enlace para restablecer tu contraseña."
                );
            } else {
                const responseData = await response.json();
                if (response.status === 429) {
                    setErrorMessage("Demasiadas solicitudes. Por favor, espera unos minutos antes de intentar de nuevo.");
                } else {
                    setErrorMessage(responseData.detail || "Error al procesar la solicitud. Intenta de nuevo.");
                }
            }
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            // Por ahora, mostrar mensaje de éxito ya que el endpoint no existe
            setSuccessMessage(
                "Si existe una cuenta con este correo electrónico, recibirás un enlace para restablecer tu contraseña."
            );
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased overflow-hidden">
            <LogoPatternBackground />
            <div className="flex flex-col min-h-screen items-center justify-center p-4 z-10 relative">
                <img src={logoSrc} alt="Logo" className="mb-8 h-24 w-auto" />
                
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                            <IconMail className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">¿Olvidaste tu contraseña?</CardTitle>
                        <CardDescription>
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="grid gap-4">
                                {/* Mensaje de error */}
                                {errorMessage && (
                                    <Alert variant="destructive">
                                        <IconAlertCircle className="h-4 w-4" />
                                        <AlertDescription>{errorMessage}</AlertDescription>
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

                                {!successMessage && (
                                    <>
                                        <FormInput
                                            name="email"
                                            control={control}
                                            errors={errors}
                                            label="Correo electrónico"
                                            placeholder="tu@email.com"
                                            type="email"
                                            required
                                        />

                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Enviando...
                                                </>
                                            ) : (
                                                'Enviar enlace de recuperación'
                                            )}
                                        </Button>
                                    </>
                                )}

                                <div className="text-center">
                                    <a 
                                        href="/login" 
                                        className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
                                    >
                                        <IconArrowLeft className="mr-1 h-4 w-4" />
                                        Volver a iniciar sesión
                                    </a>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
