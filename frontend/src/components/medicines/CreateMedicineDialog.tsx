import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";
import { MedicineCreateValues, MedicineTag, medicineCreateSchema } from "@/types/medicine";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { CreateMedicineTagDialog } from "@/components/medicines/CreateMedicineTagDialog";
import { Badge } from "../ui/badge";

const getRandomColor = () => {
    const colors = [
        "#f87171", // rojo
        "#fb923c", // naranja
        "#facc15", // amarillo
        "#4ade80", // verde
        "#22d3ee", // cyan
        "#60a5fa", // azul
        "#a78bfa", // violeta
        "#f472b6", // rosa
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

export function CreateMedicineDialog() {
    const { createMedicine, isCreating } = useMedicineMutations();
    const [open, setOpen] = React.useState(false);
    const [createTagDialogOpen, setCreateTagDialogOpen] = React.useState(false);
    const [newTagName, setNewTagName] = React.useState("");
    const [localTags, setLocalTags] = React.useState<Array<{ id: number, name: string, color: string }>>([]);

    const handleCreateTag = () => {
        if (!newTagName.trim()) return;

        const tempId = -(Date.now());
        const newTag = {
            id: tempId,
            name: newTagName.trim(),
            color: getRandomColor()
        };

        setLocalTags([...localTags, newTag]);

        const currentTags = form.getValues("tags") || [];
        form.setValue("tags", [...currentTags, tempId]);

        setNewTagName("");
    };

    const handleRemoveTag = (tagId: number) => {
        const currentTags = form.getValues("tags") || [];
        form.setValue("tags", currentTags.filter(id => id !== tagId));

        if (tagId < 0) {
            setLocalTags(localTags.filter(tag => tag.id !== tagId));
        }
    };

    const { data: medicineTags = [] } = useQuery({
        queryKey: ["medicineTags"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/medicine-tags/`);
            return data;
        },
        enabled: open
    });

    const form = useForm<MedicineCreateValues>({
        resolver: zodResolver(medicineCreateSchema),
        defaultValues: {
            name: "",
            active_substance: "",
            sale_price: 0,
            purchase_price: 0,
            expiration_date: "",
            batch_number: "",
            barcode: "",
            laboratory: "",
            concentration: "",
            prescription_required: false,
            iva_rate: 0,
            tags: [],
            inventory: {
                quantity: 0,
            }
        }
    });


    const onSubmit: SubmitHandler<MedicineCreateValues> = async (data) => {
        try {
            const newTagsPromises = localTags.map(async tag => {
                const { data: createdTag } = await axios.post(`${BASE_API_URL}/medicine-tags/`, {
                    name: tag.name,
                    color: tag.color
                });
                return { oldId: tag.id, newId: createdTag.id };
            });

            const tagMappings = await Promise.all(newTagsPromises);

            const finalTags = data.tags?.map(tagId => {
                const mapping = tagMappings.find(m => m.oldId === tagId);
                return mapping ? mapping.newId : Number(tagId);
            }) || [];

            const formData = {
                ...data,
                tags: finalTags
            };

            await createMedicine(formData);
            setOpen(false);
            form.reset();
            setLocalTags([]);
        } catch (error) {
            console.error("Error al crear medicamento:", error);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
        }
        setOpen(newOpen);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Agregar medicamento</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Agregar nuevo medicamento</DialogTitle>
                        <DialogDescription>
                            Completa la información para registrar un nuevo medicamento en el sistema.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del medicamento</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Clamoxin 500/125mg tabletas 10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="active_substance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ingrediente Activo</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ej: Paracetamol, Ibuprofeno, Amoxicilina"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="purchase_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio de compra</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                                                        field.onChange(value);
                                                    }}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="sale_price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio de venta</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="inventory.quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cantidad</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    step="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="expiration_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de caducidad</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="batch_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de lote</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: LOT-2024-001"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="barcode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Código de barras</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: 7501234567890"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="laboratory"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Laboratorio</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: Pfizer"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="concentration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Concentración</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Ej: 500mg"
                                                    {...field}
                                                    value={field.value || ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="iva_rate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>IVA del producto</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(parseFloat(value))}
                                                value={field.value?.toString() || "0"}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona tasa de IVA" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="0">Exento (0%) - Medicamentos</SelectItem>
                                                    <SelectItem value="0.16">16% - Material de curación</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                Medicamentos: 0%, Material (gasas, jeringas): 16%
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="prescription_required"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Requiere receta médica
                                            </FormLabel>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Reemplazar el campo tipo con el selector de etiquetas */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Tipos de medicamento</FormLabel>

                                        </div>
                                        <FormControl>
                                            <div className="space-y-2">
                                                {/* Aquí va el componente de tags */}
                                                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-6">
                                                    {/* Tags seleccionados existentes */}
                                                    {medicineTags.filter((tag: MedicineTag) =>
                                                        field.value?.includes(tag.id)
                                                    ).map((tag: MedicineTag) => (
                                                        <Badge
                                                            key={tag.id}
                                                            style={{ backgroundColor: tag.color || "#888888" }}
                                                            className="text-white flex items-center gap-1 pr-1" // Reducir el padding derecho
                                                        >
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                className="ml-1 bg-white/20 hover:bg-white/40 rounded-full p-0.5 flex items-center justify-center"
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Detener propagación del evento
                                                                    handleRemoveTag(tag.id);
                                                                }}
                                                                aria-label={`Eliminar etiqueta ${tag.name}`}
                                                            >
                                                                <X size={12} className="text-white" />
                                                            </button>
                                                        </Badge>
                                                    ))}

                                                    {/* Tags locales nuevos */}
                                                    {localTags.map(tag => (
                                                        <Badge
                                                            key={tag.id}
                                                            style={{ backgroundColor: tag.color }}
                                                            className="text-white flex items-center gap-1 pr-1"
                                                        >
                                                            {tag.name}
                                                            <button
                                                                type="button"
                                                                className="ml-1 bg-white/20 hover:bg-white/40 rounded-full p-0.5 flex items-center justify-center"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveTag(tag.id);
                                                                }}
                                                                aria-label={`Eliminar etiqueta ${tag.name}`}
                                                            >
                                                                <X size={12} className="text-white" />
                                                            </button>
                                                        </Badge>
                                                    ))}

                                                    {/* Input para nuevos tags */}
                                                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full h-6">
                                                        <input
                                                            type="text"
                                                            value={newTagName}
                                                            onChange={e => setNewTagName(e.target.value)}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    handleCreateTag();
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                if (newTagName.trim()) {
                                                                    handleCreateTag();
                                                                }
                                                            }}
                                                            className="bg-transparent border-none focus:outline-none text-sm w-20"
                                                            placeholder="+ Nuevo"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Selector de tags existentes */}
                                                <div className="pt-1">
                                                    <p className="text-xs text-muted-foreground mb-2">Tags disponibles:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {medicineTags.filter((tag: MedicineTag) =>
                                                            !field.value?.includes(tag.id)
                                                        ).map((tag: MedicineTag) => (
                                                            <Badge
                                                                key={tag.id}
                                                                style={{ backgroundColor: tag.color || "#888888" }}
                                                                className="text-white cursor-pointer opacity-70 hover:opacity-100"
                                                                onClick={() => {
                                                                    const currentTags = field.value || [];
                                                                    field.onChange([...currentTags, tag.id]);
                                                                }}
                                                            >
                                                                {tag.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />



                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline" type="button">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating ? "Creando..." : "Crear medicamento"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Diálogo para crear tipos */}
            {createTagDialogOpen && (
                <div
                    className="fixed inset-0 z-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        setCreateTagDialogOpen(false);
                    }}
                >
                    <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
                    <div
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="bg-white rounded-lg shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <CreateMedicineTagDialog
                                onClose={() => setCreateTagDialogOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreateMedicineDialog;