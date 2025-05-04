import * as React from "react";
import { useForm } from "react-hook-form";
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";
import { MedicineCreateValues, medicineCreateSchema } from "@/types/medicine";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { MultiSelect } from "@/components/ui/multi-select";
import { CreateMedicineTagDialog } from "@/components/medicines/CreateMedicineTagDialog";

export function CreateMedicineDialog() {
    const { createMedicine, isCreating } = useMedicineMutations();
    const [open, setOpen] = React.useState(false);
    const [createTagDialogOpen, setCreateTagDialogOpen] = React.useState(false);

    // Query para obtener las etiquetas existentes
    const { data: medicineTags = [], isLoading: isLoadingTags } = useQuery({
        queryKey: ["medicineTags"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/medicine-tags/`);
            return data;
        },
        enabled: open // Solo carga cuando el diálogo está abierto
    });

    const form = useForm<MedicineCreateValues>({
        resolver: zodResolver(medicineCreateSchema),
        defaultValues: {
            name: "",
            description: "",
            sale_price: 0,
            purchase_price: 0,
            tags: [],
            inventory: {
                quantity: 0,
            }
        }
    });

    // Componente para mostrar cuando no hay etiquetas
    const EmptyTagsContent = () => (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">No hay tipos de medicamentos registrados</p>
            <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setCreateTagDialogOpen(true)}
            >
                Crear nuevo tipo
            </Button>
        </div>
    );

    const onSubmit = async (data: MedicineCreateValues) => {
        try {
            await createMedicine(data);
            setOpen(false);
            form.reset();
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
                                                placeholder="Ej: Paracetamol 500mg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descripción del medicamento"
                                                {...field}
                                                rows={3}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
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
                            </div>

                            {/* Reemplazar el campo tipo con el selector de etiquetas */}
                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Tipos de medicamento</FormLabel>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => setCreateTagDialogOpen(true)}
                                                type="button"
                                            >
                                                Gestionar tipos
                                            </Button>
                                        </div>
                                        <FormControl>
                                            {isLoadingTags ? (
                                                <div className="border rounded-md p-3 text-sm text-muted-foreground">Cargando tipos...</div>
                                            ) : medicineTags.length === 0 ? (
                                                <EmptyTagsContent />
                                            ) : (
                                                <MultiSelect
                                                    placeholder="Seleccionar tipos"
                                                    options={medicineTags.map((tag: any) => ({
                                                        label: tag.name,
                                                        value: tag.id.toString(),
                                                        color: tag.color
                                                    }))}
                                                    selected={field.value || []}
                                                    onChange={(selected) => field.onChange(selected)}
                                                    onCreateClick={() => setCreateTagDialogOpen(true)}
                                                />
                                            )}
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
                                        <FormLabel>Cantidad en inventario</FormLabel>
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