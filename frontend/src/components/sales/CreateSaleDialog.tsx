import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SaleCreateValues, SaleItemValues, saleFormSchema } from "@/types/sales";
import { useSaleMutations } from "@/hooks/useSaleMutations";
import { Medicine } from "@/types/medicine";
import { Client } from "@/types/client";
import { BASE_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CreateSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export function CreateSaleDialog({ open, onOpenChange }: CreateSaleDialogProps) {
    const { createSale } = useSaleMutations();
    const [items, setItems] = useState<SaleItemValues[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<number>(0);
    const [itemQuantity, setItemQuantity] = useState<number>(1);

    // Cargar medicamentos desde la API
    const { data: medicines } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/medicines/`);
            return data;
        },
        enabled: open,
    });

    // Cargar clientes desde la API
    const { data: clients } = useQuery<Client[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/clients/`);
            return data;
        },
        enabled: open,
    });

    const form = useForm<SaleCreateValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            client_id: 0,
            user_id: 1,
            document_type: "invoice",
            iva_rate: 0.16,
            shipping_status: "pending",
            payment_status: "pending",
            payment_method: "transfer",
            notes: "",
            items: [],
        },
    });

    // Agregar un item a la lista
    const addItem = () => {
        if (!selectedMedicine || itemQuantity <= 0) return;
        
        const medicine = medicines?.find(m => m.id === selectedMedicine);
        if (!medicine) return;

        // Verificar si ya existe el medicamento
        const existingIndex = items.findIndex(item => item.medicine_id === selectedMedicine);
        
        if (existingIndex >= 0) {
            // Actualizar cantidad si ya existe
            const updatedItems = [...items];
            updatedItems[existingIndex].quantity += itemQuantity;
            setItems(updatedItems);
        } else {
            // Agregar nuevo item
            const newItem: SaleItemValues = {
                medicine_id: selectedMedicine,
                quantity: itemQuantity,
                unit_price: medicine.sale_price,
                discount: 0,
            };
            setItems([...items, newItem]);
        }

        // Resetear selección
        setSelectedMedicine(0);
        setItemQuantity(1);
    };

    // Eliminar un item
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Calcular totales con IVA por producto
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price) - item.discount;
    }, 0);

    // Calcular IVA basado en cada producto
    const documentType = form.watch("document_type");
    const ivaAmount = documentType === "invoice" 
        ? items.reduce((sum, item) => {
            const medicine = medicines?.find(m => m.id === item.medicine_id);
            const itemSubtotal = (item.quantity * item.unit_price) - item.discount;
            const productIvaRate = medicine?.iva_rate || 0;
            return sum + (itemSubtotal * productIvaRate);
        }, 0)
        : 0;
    const total = subtotal + ivaAmount;

    const onSubmit = async (data: SaleCreateValues) => {
        if (items.length === 0) {
            form.setError("items", { message: "Agrega al menos un medicamento" });
            return;
        }

        const saleData: SaleCreateValues = {
            ...data,
            items: items,
        };

        await createSale(saleData);
        onOpenChange(false);
        form.reset();
        setItems([]);
    };

    const getMedicineName = (medicineId: number) => {
        return medicines?.find(m => m.id === medicineId)?.name || "Desconocido";
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                form.reset();
                setItems([]);
            }
            onOpenChange(isOpen);
        }}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Nueva Venta / Pedido</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo pedido. Puedes agregar múltiples medicamentos.
                    </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Información del cliente y documento */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="client_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cliente *</FormLabel>
                                        <Select 
                                            onValueChange={(value) => field.onChange(parseInt(value))}
                                            value={field.value ? field.value.toString() : undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar cliente" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {clients?.map((client) => (
                                                    <SelectItem key={client.id} value={client.id.toString()}>
                                                        {client.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="document_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Documento *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="invoice">Factura (con IVA)</SelectItem>
                                                <SelectItem value="remission">Nota de Remisión (sin IVA)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="payment_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado de Pago</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="partial">Parcial</SelectItem>
                                                <SelectItem value="paid">Pagado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Método de Pago</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Seleccionar" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="cash">Efectivo</SelectItem>
                                                <SelectItem value="transfer">Transferencia</SelectItem>
                                                <SelectItem value="credit">Crédito</SelectItem>
                                                <SelectItem value="check">Cheque</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Agregar productos */}
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Agregar Medicamentos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-sm font-medium">Medicamento</label>
                                        <Select 
                                            value={selectedMedicine.toString()} 
                                            onValueChange={(v) => setSelectedMedicine(parseInt(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar medicamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {medicines?.map((medicine) => (
                                                    <SelectItem key={medicine.id} value={medicine.id.toString()}>
                                                        {medicine.name} - {formatCurrency(medicine.sale_price)} 
                                                        {medicine.inventory && ` (Stock: ${medicine.inventory.quantity})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <label className="text-sm font-medium">Cantidad</label>
                                        <Input 
                                            type="number" 
                                            min="1"
                                            value={itemQuantity}
                                            onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                        />
                                    </div>
                                    <Button type="button" onClick={addItem} disabled={!selectedMedicine}>
                                        <IconPlus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Lista de items agregados */}
                                {items.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Medicamento</TableHead>
                                                <TableHead className="text-right">Cant.</TableHead>
                                                <TableHead className="text-right">Precio</TableHead>
                                                <TableHead className="text-right">IVA</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="w-10" />
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => {
                                                const medicine = medicines?.find(m => m.id === item.medicine_id);
                                                const productIvaRate = medicine?.iva_rate || 0;
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>{getMedicineName(item.medicine_id)}</TableCell>
                                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={productIvaRate > 0 ? "text-amber-600" : "text-green-600"}>
                                                                {(productIvaRate * 100).toFixed(0)}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="icon"
                                                                onClick={() => removeItem(index)}
                                                                className="h-8 w-8 text-red-600"
                                                            >
                                                                <IconTrash className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}

                                {items.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No hay medicamentos agregados
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Totales */}
                        <Card>
                            <CardContent className="pt-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {documentType === "invoice" && ivaAmount > 0 && (
                                        <div className="flex justify-between text-amber-600">
                                            <span>IVA (productos gravados):</span>
                                            <span>{formatCurrency(ivaAmount)}</span>
                                        </div>
                                    )}
                                    {documentType === "remission" && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span className="text-xs">Nota de remisión - Sin IVA</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notas */}
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas (opcional)</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Notas adicionales del pedido..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting || items.length === 0}>
                                {form.formState.isSubmitting ? "Creando..." : "Crear Venta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateSaleDialog;