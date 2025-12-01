import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleCreateValues, saleFormSchema } from "@/types/sales";
import { useSaleMutations } from "@/hooks/useSaleMutations";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CreateSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateSaleDialog({ open, onOpenChange }: CreateSaleDialogProps) {
    const { createSale } = useSaleMutations();

    const form = useForm<SaleCreateValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            medicine_id: 0,
            quantity: 1,
            total_price: 0,
            client_id: 0,
            sale_date: new Date().toISOString(),
            user_id: 1, // Default user, should be from auth
            shipping_status: "pending",
            payment_status: "pending",
        },
    });

    const onSubmit: SubmitHandler<SaleCreateValues> = async (data) => {
        await createSale(data);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Venta</DialogTitle>
                    <DialogDescription>
                        Registra una nueva venta en el sistema.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="medicine_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Medicamento *</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar medicamento" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* TODO: Load medicines from API */}
                                            <SelectItem value="1">Paracetamol</SelectItem>
                                            <SelectItem value="2">Ibuprofeno</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="client_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cliente *</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar cliente" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* TODO: Load clients from API */}
                                            <SelectItem value="1">Cliente 1</SelectItem>
                                            <SelectItem value="2">Cliente 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="total_price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio Total *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
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
                            name="payment_status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado de Pago *</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="completed">Completado</SelectItem>
                                            <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="shipping_status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado de Envío *</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="shipped">Enviado</SelectItem>
                                            <SelectItem value="delivered">Entregado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Creando..." : "Crear Venta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}