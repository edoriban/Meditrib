import React, { useState } from "react";
import { FormInput } from "@/components/ui/form-input";
import { MedicineEditFormProps } from "@/types/medicine";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { CreateMedicineTagDialog } from "@/components/medicines/CreateMedicineTagDialog";
import { Button } from "@/components/ui/button";
import { TagToggleGroup } from "@/components/medicines/TagToggleGroup";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const MedicineEditForm: React.FC<MedicineEditFormProps> = ({ form }) => {
    const { control, formState: { errors } } = form;
    const [createTagDialogOpen, setCreateTagDialogOpen] = useState(false);

    const { data: medicineTags = [], isLoading: isLoadingTags } = useQuery({
        queryKey: ["medicineTags"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/medicine-tags/`);
            return data;
        }
    });

    // Componente personalizado para renderizar cuando no hay tags
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

    return (
        <>
            <FormInput
                name="name"
                control={control}
                label="Nombre del medicamento"
                placeholder="Paracetamol 500mg"
                errors={errors}
            />

            <FormInput
                name="description"
                control={control}
                label="Descripción"
                placeholder="Descripción del medicamento"
                errors={errors}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={control}
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
                    control={control}
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
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={control}
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

            <FormField
                control={control}
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
                                <TagToggleGroup
                                    tags={medicineTags}
                                    selectedTags={field.value?.map(tagId => tagId.toString())}
                                    onChange={(selected) => {
                                        const numericTags = selected.map(tagId => Number(tagId));
                                        field.onChange(numericTags);
                                    }}
                                />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={control}
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
                                onChange={(e) => {
                                    const value = e.target.value === "" ? undefined : parseInt(e.target.value, 10);
                                    field.onChange(value);
                                }}
                                value={field.value ?? ""}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Dialog para crear tipos */}
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
};