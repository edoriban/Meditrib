import React from "react";
import { FormInput } from "@/components/ui/form-input";
import { MedicineEditFormProps } from "@/types/medicine";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const MedicineEditForm: React.FC<MedicineEditFormProps> = ({ form }) => {
    const { control, formState: { errors }, setValue, watch } = form;

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

            <FormInput
                name="type"
                control={control}
                label="Tipo de medicamento"
                placeholder="Analgésico"
                errors={errors}
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