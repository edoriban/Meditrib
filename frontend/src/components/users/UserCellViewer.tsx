import { forwardRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "@/types/user";
import { UserFormValues, userFormSchema } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { UserEditForm } from "./UserEditForm";
import { UserEditActions } from "./UserEditActions";

interface UserCellViewerProps {
    user: User;
    onUpdate: (data: Partial<UserFormValues>) => void;
    onDelete?: (userId: number) => void;
}

export const UserCellViewer = forwardRef<HTMLButtonElement, UserCellViewerProps>(
    ({ user, onUpdate, onDelete }, ref) => {
        const isMobile = useIsMobile();
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
        const [isDeleting, setIsDeleting] = useState(false);

        const form = useForm<UserFormValues>({
            resolver: zodResolver(userFormSchema),
            defaultValues: {
                name: user.name,
                email: user.email,
                role_id: user.role.id,
            }
        });

        const { data: roles } = useQuery({
            queryKey: ["roles"],
            queryFn: async () => {
                const { data } = await axios.get(`${BASE_API_URL}/roles/`);
                return data;
            },
        });

        const handleDeleteUser = async () => {
            if (!user.id || !onDelete) return;
            setIsDeleting(true);
            try {
                await axios.delete(`${BASE_API_URL}/users/${user.id}`);
                toast.success(`Usuario ${user.name} eliminado correctamente`);
                onDelete(user.id);
            } catch (error) {
                console.error("Error al eliminar usuario:", error);
                toast.error("No se pudo eliminar el usuario. Inténtalo de nuevo.");
            } finally {
                setIsDeleting(false);
                setIsDeleteDialogOpen(false);
            }
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
                        <form onSubmit={form.handleSubmit(onUpdate)} className="space-y-4">
                            <UserEditForm form={form} roles={roles || []} />
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
                                <Button type="submit" className="w-full">Guardar cambios</Button>
                                <UserEditActions
                                    user={user}
                                    onDelete={onDelete ? () => onDelete(user.id) : undefined}
                                    isDeleteDialogOpen={isDeleteDialogOpen}
                                    setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                                    handleDeleteUser={handleDeleteUser}
                                    isDeleting={isDeleting}
                                />
                            </DrawerFooter>
                        </form>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
);