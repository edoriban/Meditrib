import React from "react";
import { FormInput } from "@/components/ui/form-input";
import { MedicineEditFormProps } from "@/types/medicine";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";

export const MedicineEditForm: React.FC<MedicineEditFormProps> = ({ form }) => {
    const { control, formState: { errors }, setValue, watch } = form;
    const { data: medicineTags = [] } = useQuery({
        queryKey: ["medicineTags"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/medicine-tags/`);
            return data;
        }
    });
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
            </div>

            <FormField
                control={control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tipos de medicamento</FormLabel>
                        <FormControl>
                            <MultiSelect
                                placeholder="Seleccionar tipos"
                                options={medicineTags.map((tag: any) => ({
                                    label: tag.name,
                                    value: tag.id.toString(),
                                    color: tag.color
                                }))}
                                selected={field.value || []}
                                onChange={(selected) => field.onChange(selected)}
                            />
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
        </>
    );
};