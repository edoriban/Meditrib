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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProductTag, ProductTagFormValues, productTagSchema, ProductTagWithUIState, CreateProductTagDialogProps } from "@/types/product";



export function CreateProductTagDialog({ onClose }: CreateProductTagDialogProps = {}) {
    const [open, setOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState("create");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [editingTag, setEditingTag] = React.useState<ProductTag | null>(null);
    const [color, setColor] = React.useState("#6366f1");

    const queryClient = useQueryClient();

    const { data: tags = [], isLoading } = useQuery<ProductTagWithUIState[]>({
        queryKey: ["productTags"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/product-tags/`);
            return data;
        },
        enabled: open && activeTab === "manage"
    });

    const { control, handleSubmit, formState: { errors }, reset, setValue } = useForm<ProductTagFormValues>({
        resolver: zodResolver(productTagSchema),
        defaultValues: {
            name: "",
            description: "",
            color: "#6366f1", // Valor predeterminado para el color (indigo)
        }
    });



    React.useEffect(() => {
        if (editingTag) {
            setValue("name", editingTag.name);
            setValue("description", editingTag.description || "");
            setValue("color", editingTag.color || "#6366f1");
            setActiveTab("create");
        }
    }, [editingTag, setValue]);

    const onSubmit = async (data: ProductTagFormValues) => {
        setIsSubmitting(true);

        try {
            if (editingTag) {
                await axios.put(`${BASE_API_URL}/product-tags/${editingTag.id}`, data);
                toast.success(`Etiqueta "${data.name}" actualizada correctamente`);

                queryClient.setQueryData(['productTags'], (oldData: any) => {
                    if (!oldData) return [];
                    return oldData.map((tag: any) =>
                        tag.id === editingTag.id
                            ? { ...tag, ...data }
                            : tag
                    );
                });
            } else {
                const response = await axios.post(`${BASE_API_URL}/product-tags/`, data);
                toast.success(`Etiqueta "${data.name}" creada correctamente`);

                queryClient.setQueryData(['productTags'], (oldData: any) => {
                    if (!oldData) return [response.data];
                    return [...oldData, response.data];
                });
            }

            queryClient.invalidateQueries({ queryKey: ['productTags'] });
            handleResetForm();
            setOpen(false);
        } catch (error) {
            console.error("Error al gestionar etiqueta:", error);
            toast.error(`No se pudo ${editingTag ? "actualizar" : "crear"} la etiqueta. Inténtelo de nuevo.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResetForm = () => {
        reset();
        setEditingTag(null);
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            handleResetForm();
            if (onClose) onClose();
        }
        setOpen(newOpen);
    };

    const handleEditTag = (tag: ProductTag) => {
        setEditingTag(tag);
    };

    const confirmDelete = async (tag: ProductTag) => {
        if (!tag) return;

        try {
            await axios.delete(`${BASE_API_URL}/product-tags/${tag.id}`);
            toast.success(`Etiqueta "${tag.name}" eliminada correctamente`);
            queryClient.invalidateQueries({ queryKey: ['productTags'] });

            if (editingTag?.id === tag.id) {
                handleResetForm();
            }
        } catch (error) {
            console.error("Error al eliminar etiqueta:", error);
            toast.error("No se pudo eliminar la etiqueta. Inténtelo de nuevo.");
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        if (value === "manage") {
            handleResetForm();
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <IconSettings className="mr-1 h-4 w-4" />
                        Gestionar Tipos
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingTag ? "Editar etiqueta" : "Gestionar etiquetas de medicamentos"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingTag
                                ? `Modifica la etiqueta "${editingTag.name}"`
                                : "Crea y gestiona las etiquetas para clasificar medicamentos"
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="create">
                                {editingTag ? "Editar etiqueta" : "Crear etiqueta"}
                            </TabsTrigger>
                            <TabsTrigger value="manage">Etiquetas existentes</TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="space-y-4 py-2">
                            <form id="tag-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <FormInput
                                    name="name"
                                    control={control}
                                    label="Nombre de etiqueta"
                                    placeholder="Ej: Analgésico, Antibiótico, Antiinflamatorio"
                                    errors={errors}
                                />

                                <FormInput
                                    name="description"
                                    control={control}
                                    label="Descripción (opcional)"
                                    placeholder="Describe brevemente este tipo de medicamento"
                                    errors={errors}
                                />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Color de la etiqueta
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="color"
                                            {...control.register("color")}
                                            className="w-16 h-8 p-1"
                                            value={color}
                                            onChange={(e) => {
                                                setColor(e.target.value);
                                                setValue("color", e.target.value);
                                            }
                                            }
                                        />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">
                                                Este color se usará para mostrar visualmente la etiqueta
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <DialogFooter>
                                {editingTag && (
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
                                    form="tag-form"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? (editingTag ? "Actualizando..." : "Creando...")
                                        : (editingTag ? "Guardar cambios" : "Crear etiqueta")}
                                </Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="manage" className="space-y-4 py-2">
                            {isLoading ? (
                                <div className="flex justify-center py-4">Cargando etiquetas...</div>
                            ) : tags.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    No hay etiquetas definidas todavía
                                </div>
                            ) : (
                                <div className="rounded-md border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Etiqueta</TableHead>
                                                <TableHead>Descripción</TableHead>
                                                <TableHead className="w-[100px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tags.map((tag) => (
                                                <TableRow key={tag.id}>
                                                    <TableCell>
                                                        <Badge
                                                            className="px-2 py-1"
                                                            style={{
                                                                backgroundColor: tag.color || "#6366f1",
                                                                color: "#ffffff"
                                                            }}
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{tag.description || "-"}</TableCell>
                                                    <TableCell>
                                                        {tag.pendingDelete ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-destructive font-medium">¿Eliminar?</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        confirmDelete(tag);
                                                                    }}
                                                                >
                                                                    Sí
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => {
                                                                        const updatedTags = tags.map(t =>
                                                                            t.id === tag.id ? { ...t, pendingDelete: false } : t
                                                                        );
                                                                        queryClient.setQueryData(['productTags'], updatedTags);
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
                                                                    onClick={() => handleEditTag(tag)}
                                                                    title="Editar"
                                                                >
                                                                    <IconEdit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="text-destructive"
                                                                    onClick={() => {
                                                                        const updatedTags = tags.map(t =>
                                                                            t.id === tag.id ? { ...t, pendingDelete: true } : t
                                                                        );
                                                                        queryClient.setQueryData(['productTags'], updatedTags);
                                                                    }}
                                                                    title="Eliminar"
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
                                    {tags.length} {tags.length === 1 ? "etiqueta" : "etiquetas"} en total
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => { setActiveTab("create"); handleResetForm(); }}
                                >
                                    <IconPlus className="mr-1 h-4 w-4" />
                                    Nueva etiqueta
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default CreateProductTagDialog;