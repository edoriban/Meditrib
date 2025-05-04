import React, { forwardRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/types/user";
import { UserFormValues, userFormSchema } from "@/types/forms";
import { useIsMobile } from "@/hooks/use-mobile";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormInput } from "@/components/ui/form-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    DrawerClose,
} from "@/components/ui/drawer";

interface UserCellViewerProps {
    user: User;
    onUpdate: (data: Partial<UserFormValues>) => void;
}

export const UserCellViewer = React.forwardRef<
    HTMLButtonElement,
    UserCellViewerProps
>(({ user, onUpdate }, ref) => {
    const isMobile = useIsMobile();
    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            role_id: user.role.id,
        }
    });

    const roleId = watch("role_id");

    const { data: roles } = useQuery({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/roles/`);
            return data;
        },
    });

    const onSubmit = (data: UserFormValues) => {
        onUpdate(data);
    };

    return (
        <Drawer direction={isMobile ? "bottom" : "right"}>
            <DrawerTrigger asChild>
                <Button
                    variant="link"
                    className="p-0 text-left"
                    ref={ref}
                >
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                    </div>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-w-md">
                <DrawerHeader>
                    <DrawerTitle>Editar Usuario</DrawerTitle>
                    <DrawerDescription>
                        Actualiza los datos del usuario {user.name}
                    </DrawerDescription>
                </DrawerHeader>
                <div className="px-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormInput
                            name="name"
                            control={control}
                            label="Nombre"
                            placeholder="Nombre completo"
                            errors={errors}
                        />

                        <FormInput
                            name="email"
                            control={control}
                            label="Email"
                            placeholder="correo@ejemplo.com"
                            type="email"
                            errors={errors}
                        />

                        <div className="space-y-2">
                            <label htmlFor="role" className="text-sm font-medium">
                                Rol
                            </label>
                            <Select
                                value={roleId?.toString()}
                                onValueChange={(value) => {
                                    setValue("role_id", parseInt(value), {
                                        shouldValidate: true,
                                        shouldDirty: true
                                    });
                                }}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Actividad reciente</label>
                            <div className="rounded-md border p-3">
                                <div className="text-sm">
                                    <p>Último acceso: <span className="font-medium">Hace 2 días</span></p>
                                    <p>Creado el: <span className="font-medium">12/03/2025</span></p>
                                </div>
                            </div>
                        </div>

                        <DrawerFooter>
                            <div className="flex gap-2">
                                <Button type="submit">Guardar cambios</Button>
                                <DrawerClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                </DrawerClose>
                            </div>
                        </DrawerFooter>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
);