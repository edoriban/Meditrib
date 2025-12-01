import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Role } from "@/types/roles";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconShield, IconPlus, IconEdit, IconTrash, IconUsers, IconLock, IconKey } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const { data: roles, isLoading } = useQuery<Role[]>({
        queryKey: ["roles"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/roles/`);
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => axios.post(`${BASE_API_URL}/roles/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            setShowCreateDialog(false);
            resetForm();
            toast.success("Rol creado exitosamente");
        },
        onError: (error: unknown) => {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            if (axiosError.response?.data?.detail === "Role already registered") {
                toast.error("Ya existe un rol con ese nombre");
            } else {
                toast.error("Error al crear el rol");
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: typeof formData }) => 
            axios.put(`${BASE_API_URL}/roles/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            setEditingRole(null);
            resetForm();
            toast.success("Rol actualizado");
        },
        onError: (error: unknown) => {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            if (axiosError.response?.data?.detail === "Role name already registered") {
                toast.error("Ya existe un rol con ese nombre");
            } else {
                toast.error("Error al actualizar el rol");
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => axios.delete(`${BASE_API_URL}/roles/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
            setDeletingRole(null);
            toast.success("Rol eliminado");
        },
        onError: () => {
            toast.error("Error al eliminar el rol. Puede tener usuarios asignados.");
        },
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: ''
        });
    };

    const handleEdit = (role: Role) => {
        setFormData({
            name: role.name,
            description: role.description || ''
        });
        setEditingRole(role);
    };

    const handleSubmit = () => {
        if (editingRole) {
            updateMutation.mutate({ id: editingRole.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const systemRoles = ['Administrador', 'Admin', 'Administrator', 'SuperAdmin'];
    const isSystemRole = (roleName: string) => 
        systemRoles.some(sr => sr.toLowerCase() === roleName.toLowerCase());

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Roles</h1>
                        <p className="text-muted-foreground mt-2">
                            Administra los roles y permisos del sistema.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                            <IconPlus className="mr-1 h-4 w-4" />
                            Nuevo Rol
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total de Roles</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {roles?.length || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconShield className="size-4" />
                                Activos
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Roles configurados <IconShield className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Control de acceso
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Roles del Sistema</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-600">
                            {roles?.filter(r => isSystemRole(r.name)).length || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-blue-600">
                                <IconLock className="size-4" />
                                Protegidos
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Roles base <IconLock className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            No se pueden eliminar
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Roles Personalizados</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600">
                            {roles?.filter(r => !isSystemRole(r.name)).length || 0}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-purple-600">
                                <IconKey className="size-4" />
                                Custom
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Creados por usuario <IconKey className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Personalizables
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Usuarios Asignados</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                            {roles?.reduce((acc, r) => acc + (r.usersCount || 0), 0) || '-'}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-green-600">
                                <IconUsers className="size-4" />
                                Total
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Usuarios con rol <IconUsers className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Distribuidos
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Roles Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Roles</CardTitle>
                    <CardDescription>Todos los roles disponibles en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando roles...</div>
                    ) : !roles || roles.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                <IconShield className="h-8 w-8 text-gray-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Sin roles configurados</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Crea roles para controlar el acceso de usuarios.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <IconPlus className="mr-1 h-4 w-4" />
                                Crear Primer Rol
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Usuarios</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => {
                                    const isSystem = isSystemRole(role.name);
                                    return (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-full ${isSystem ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                        <IconShield className="h-4 w-4" />
                                                    </div>
                                                    {role.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground max-w-xs truncate">
                                                {role.description || 'Sin descripción'}
                                            </TableCell>
                                            <TableCell>
                                                {isSystem ? (
                                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                                        <IconLock className="mr-1 h-3 w-3" />
                                                        Sistema
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                                                        <IconKey className="mr-1 h-3 w-3" />
                                                        Personalizado
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                                                    <span>{role.usersCount ?? '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => handleEdit(role)}
                                                        title="Editar rol"
                                                    >
                                                        <IconEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => setDeletingRole(role)}
                                                        disabled={isSystem || deleteMutation.isPending}
                                                        className={isSystem ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700'}
                                                        title={isSystem ? "No se puede eliminar rol del sistema" : "Eliminar rol"}
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog || !!editingRole} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingRole(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Modifica los datos del rol' : 'Crea un nuevo rol para el sistema'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del Rol</Label>
                            <Input 
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Vendedor, Gerente, etc."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Textarea 
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe las responsabilidades de este rol"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCreateDialog(false);
                            setEditingRole(null);
                            resetForm();
                        }}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending || !formData.name.trim()}
                        >
                            {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar rol "{deletingRole?.name}"?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Si hay usuarios asignados a este rol,
                            deberás reasignarlos a otro rol primero.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
