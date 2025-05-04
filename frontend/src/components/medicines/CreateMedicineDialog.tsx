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

export function CreateMedicineDialog() {
    const { createMedicine, isCreating } = useMedicineMutations();
    const [open, setOpen] = React.useState(false);

    const form = useForm<MedicineCreateValues>({
        resolver: zodResolver(medicineCreateSchema),
        defaultValues: {
            name: "",
            description: "",
            sale_price: 0,
            purchase_price: 0,
            type: "",
            inventory: {
                quantity: 0,
            }
        }
    });

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

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de medicamento</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Analgésico"
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
    );
}
