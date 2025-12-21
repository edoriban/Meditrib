"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { toast } from "sonner"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { BASE_API_URL } from "@/config"
import { FormInput } from "@/components/ui/form-input"
import { auth } from "@/utils/auth"
import { Checkbox } from "./ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconAlertCircle, IconLoader2 } from "@tabler/icons-react"

const loginFormSchema = z.object({
  email: z.string({
    required_error: "El correo electrónico es obligatorio",
  }).email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string({
    required_error: "La contraseña es obligatoria",
  }),
  remember: z.boolean().optional().default(false)
});

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', data.email);
      formData.append('password', data.password);

      const response = await fetch(`${BASE_API_URL}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Mensajes de error específicos según el código de estado
        if (response.status === 401) {
          setErrorMessage('Correo electrónico o contraseña incorrectos. Verifica tus credenciales.');
        } else if (response.status === 404) {
          setErrorMessage('No existe una cuenta con este correo electrónico. ¿Deseas registrarte?');
        } else if (response.status === 403) {
          setErrorMessage('Tu cuenta ha sido desactivada. Contacta al administrador.');
        } else if (response.status === 429) {
          setErrorMessage('Demasiados intentos. Por favor espera unos minutos.');
        } else {
          setErrorMessage(responseData.detail || 'Error al iniciar sesión. Intenta de nuevo.');
        }
        return;
      }

      // Guardar token según preferencia
      if (data.remember) {
        localStorage.setItem('token', responseData.access_token);
      } else {
        sessionStorage.setItem('token', responseData.access_token);
      }

      toast.success('¡Bienvenido! Iniciando sesión...');

      // Obtener datos del usuario
      try {
        await auth.getCurrentUser();
      } catch (userError) {
        console.error("Error al obtener datos del usuario:", userError);
      }

      // Redirigir al dashboard
      window.location.href = '/';

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setErrorMessage('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    try {
      // Por ahora mostrar mensaje de que está en desarrollo
      toast.info('Inicio de sesión con Google estará disponible próximamente.');
      // TODO: Implementar OAuth con Google
      // window.location.href = `${BASE_API_URL}/auth/google`;
    } catch (error) {
      console.error('Error con Google OAuth:', error);
      setErrorMessage('Error al conectar con Google. Intenta de nuevo más tarde.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenido de nuevo</CardTitle>
          <CardDescription>
            Inicia sesión con tu cuenta de Google o con tu correo electrónico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {/* Mensaje de error */}
              {errorMessage && (
                <Alert variant="destructive">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                  )}
                  Iniciar sesión con Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  O continuar con
                </span>
              </div>
              <div className="grid gap-6">
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

                <div className="flex items-center space-x-2">
                  <Controller
                    name="remember"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <label htmlFor="remember" className="text-sm">
                          Recordar mi sesión
                        </label>
                      </div>
                    )}
                  />
                </div>

                <div className="text-right">
                  <a href="/forgot-password" className="text-sm underline-offset-4 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
                  {isLoading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar sesión'
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                ¿No tienes una cuenta?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Regístrate
                </a>
              </div>
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