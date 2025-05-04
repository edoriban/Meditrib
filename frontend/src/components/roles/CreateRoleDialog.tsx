import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import { IconPlus, IconSettings, IconEdit, IconTrash } from "@tabler/icons-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import axios from "axios";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Role, RoleFormValues, RoleWithUIState, roleSchema } from "@/types/roles";

export function CreateRoleDialog() {
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("create");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [editingRole, setEditingRole] = React.useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = React.useState<Role | null>(null);

    const queryClient = useQueryClient();

    const { data: roles = [], isLoading } = useQuery<RoleWithUIState[]>({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/roles/`);
            return data;
        },
        enabled: open && activeTab === "manage"
    });

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
        }
    });

    React.useEffect(() => {
        if (editingRole) {
            setValue("name", editingRole.name);
            setValue("description", editingRole.description || "");
            setActiveTab("create");
        }
    }, [editingRole, setValue]);

    const onSubmit = async (data: RoleFormValues) => {
        setIsSubmitting(true);

        try {
            if (editingRole) {
                await axios.put(`${BASE_API_URL}/roles/${editingRole.id}`, data);
                toast.success(`Rol "${data.name}" actualizado correctamente`);

                queryClient.setQueryData(['roles'], (oldData: any) => {
                    if (!oldData) return [];
                    return oldData.map((role: any) =>
                        role.id === editingRole.id
                            ? { ...role, ...data }
                            : role
                    );
                });
            } else {
                const response = await axios.post(`${BASE_API_URL}/roles/`, data);
                toast.success(`Rol "${data.name}" creado correctamente`);

                queryClient.setQueryData(['roles'], (oldData: any) => {
                    if (!oldData) return [response.data];
                    return [...oldData, response.data];
                });
            }

            setTimeout(() => {
                queryClient.invalidateQueries({ queryKey: ['roles'] });
            }, 200);

            handleResetForm();
            setOpen(false);
        } catch (error) {
            console.error("Error al gestionar rol:", error);
            toast.error(`No se pudo ${editingRole ? "actualizar" : "crear"} el rol. Inténtelo de nuevo.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetForm = () => {
        reset();
        setEditingRole(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            handleResetForm();
        }
        setOpen(newOpen);
    };

    const handleEditRole = (role: any) => {
        setEditingRole(role);
    };


    const confirmDelete = async (role: Role) => {
        if (!role) return;

        try {
            setDeleteDialogOpen(false);

            await axios.delete(`${BASE_API_URL}/roles/${role.id}`);

            toast.success(`Rol "${role.name}" eliminado correctamente`);
            queryClient.invalidateQueries({ queryKey: ['roles'] });

            // Usar el parámetro role en lugar de roleToDelete
            if (editingRole?.id === role.id) {
                handleResetForm();
            }
        } catch (error) {
            console.error("Error al eliminar rol:", error);
            toast.error("No se pudo eliminar el rol. Inténtelo de nuevo.");
        } finally {
            setTimeout(() => {
                setRoleToDelete(null);
            }, 100);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === "create" && editingRole) {
        } else if (value === "manage") {
            handleResetForm();
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <IconSettings className="mr-1 h-4 w-4" />
                        Gestionar Roles
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{editingRole ? "Editar rol" : "Gestión de roles"}</DialogTitle>
                        <DialogDescription>
                            {editingRole
                                ? `Modifica el rol "${editingRole.name}"`
                                : "Crea nuevos roles y gestiona los existentes para el sistema"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="create">
                                {editingRole ? "Editar rol" : "Crear rol"}
                            </TabsTrigger>
                            <TabsTrigger value="manage">Roles existentes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="space-y-4 py-2">
                            <form id="role-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <FormInput
                                    name="name"
                                    control={control}
                                    label="Nombre del rol"
                                    placeholder="Ej: Médico, Administrador, Recepcionista"
                                    errors={errors}
                                />

                                <FormInput
                                    name="description"
                                    control={control}
                                    label="Descripción (opcional)"
                                    placeholder="Describe brevemente las funciones de este rol"
                                    errors={errors}
                                />
                            </form>

                            <DialogFooter>
                                {editingRole && (
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={handleResetForm}
                                    >
                                        Cancelar edición
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    form="role-form"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? (editingRole ? "Actualizando..." : "Creando...")
                                        : (editingRole ? "Guardar cambios" : "Crear rol")}
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="manage" className="space-y-4 py-2">
                            {isLoading ? (
                                <div className="flex justify-center py-4">Cargando roles...</div>
                            ) : roles.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    No hay roles definidos todavía
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nombre</TableHead>
                                                <TableHead>Descripción</TableHead>
                                                <TableHead className="w-[100px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {roles.map((role: any) => (
                                                <TableRow key={role.id}>
                                                    <TableCell className="font-medium">{role.name}</TableCell>
                                                    <TableCell>{role.description || "-"}</TableCell>
                                                    <TableCell>
                                                        {role.pendingDelete ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-destructive font-medium">¿Eliminar?</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        confirmDelete(role);
                                                                    }}
                                                                >
                                                                    Sí
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        const updatedRoles = roles.map(r =>
                                                                            r.id === role.id ? { ...r, pendingDelete: false } : r
                                                                        );
                                                                        queryClient.setQueryData(['roles'], updatedRoles);
                                                                    }}
                                                                >
                                                                    No
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    onClick={() => handleEditRole(role)}
                                                                    title="Editar"
                                                                >
                                                                    <IconEdit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="text-destructive"
                                                                    onClick={() => {
                                                                        const updatedRoles = roles.map(r =>
                                                                            r.id === role.id ? { ...r, pendingDelete: true } : r
                                                                        );
                                                                        queryClient.setQueryData(['roles'], updatedRoles);
                                                                    }}
                                                                    title="Eliminar"
                                                                    disabled={role.name === "Admin" || role.name === "Usuario"}
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-muted-foreground">
                                    {roles.length} {roles.length === 1 ? "rol" : "roles"} en total
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setActiveTab("create"); handleResetForm(); }}
                                >
                                    <IconPlus className="mr-1 h-4 w-4" />
                                    Nuevo rol
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}