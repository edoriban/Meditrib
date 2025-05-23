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
import { FormInput } from "@/components/ui/form-input" // Importar FormInput
import { auth } from "@/utils/auth" // Importar el helper de autenticación
import { Checkbox } from "./ui/checkbox"

const loginFormSchema = z.object({
  email: z.string({
    required_error: "El correo electrónico es obligatorio",
  }).email({ message: "Por favor, introduce un correo electrónico válido." }),
  password: z.string({
    required_error: "La contraseña es obligatoria",
  }),
  remember: z.boolean().default(false)
});

type LoginFormValues = z.infer<typeof loginFormSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);

  // Añadir control para FormInput
  const { handleSubmit, control, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    console.log("Datos del formulario:", data);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const tokenData = await response.json();

      if (data.remember) {
        localStorage.setItem('token', tokenData.access_token);
      } else {
        sessionStorage.setItem('token', tokenData.access_token);
      }

      toast.success('Inicio de sesión exitoso');

      try {
        const currentUser = await auth.getCurrentUser();
        console.log("Usuario autenticado:", currentUser);
      } catch (userError) {
        console.error("Error al obtener datos del usuario:", userError);
      }

      window.location.href = '/';

    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Ha ocurrido un problema al iniciar sesión'}`);
      console.error('Error al iniciar sesión:', error);
    } finally {
      setIsLoading(false);
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
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
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
                  <a href="#" className="text-sm underline-offset-4 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
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
        Al hacer clic en continuar, aceptas nuestros <a href="#">Términos de Servicio</a>{" "}
        y <a href="#">Política de Privacidad</a>.
      </div>
    </div>
  )
}