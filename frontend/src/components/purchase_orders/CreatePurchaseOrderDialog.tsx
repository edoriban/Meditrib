import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PurchaseOrderCreateValues, purchaseOrderFormSchema } from "@/types/purchase_orders";
import { usePurchaseOrderMutations } from "@/hooks/usePurchaseOrderMutations";
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

interface CreatePurchaseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreatePurchaseOrderDialog({ open, onOpenChange }: CreatePurchaseOrderDialogProps) {
    const { createPurchaseOrder } = usePurchaseOrderMutations();

    const form = useForm<PurchaseOrderCreateValues>({
        resolver: zodResolver(purchaseOrderFormSchema),
        defaultValues: {
            supplier_id: 0,
            order_date: new Date().toISOString().split('T')[0],
            status: "pending",
            items: [],
            created_by: 1, // Default user
        },
    });

    const onSubmit: SubmitHandler<PurchaseOrderCreateValues> = async (data) => {
        await createPurchaseOrder(data);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Orden de Compra</DialogTitle>
                    <DialogDescription>
                        Crea una nueva orden de compra para un proveedor.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="supplier_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Proveedor *</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar proveedor" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* TODO: Load suppliers from API */}
                                            <SelectItem value="1">Proveedor 1</SelectItem>
                                            <SelectItem value="2">Proveedor 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="order_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Orden *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expected_delivery_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de Entrega Esperada</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado *</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pending">Pendiente</SelectItem>
                                            <SelectItem value="approved">Aprobada</SelectItem>
                                            <SelectItem value="delivered">Entregada</SelectItem>
                                            <SelectItem value="cancelled">Cancelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="text-sm text-muted-foreground">
                            Nota: Los items de la orden se pueden agregar después de crear la orden básica.
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Creando..." : "Crear Orden"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}