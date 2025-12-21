import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SaleCreateValues, SaleItemValues, SaleFormValues, saleFormSchema } from "@/types/sales";
import { useSaleMutations } from "@/hooks/useSaleMutations";
import { Medicine } from "@/types/medicine";
import { Client } from "@/types/clients";
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
import { IconPlus, IconTrash, IconMinus } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarcodeSearchInput } from "@/components/medicines/BarcodeSearchInput";
import { EditablePriceCell } from "@/components/sales/EditablePriceCell";
import { StockConfirmationDialog } from "@/components/sales/StockConfirmationDialog";

// Tipo para problemas de stock
interface StockIssue {
    medicine_id: number;
    medicine_name: string;
    requested: number;
    available: number;
    shortage: number;
}

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
    const { createSale, createSaleWithAutoAdjust, isCreating } = useSaleMutations();
    const [items, setItems] = useState<SaleItemValues[]>([]);

    // Estados para manejo de stock insuficiente
    const [stockDialogOpen, setStockDialogOpen] = useState(false);
    const [stockIssues, setStockIssues] = useState<StockIssue[]>([]);
    const [pendingSaleData, setPendingSaleData] = useState<SaleCreateValues | null>(null);

    // Mutation para verificar stock
    const checkStockMutation = useMutation({
        mutationFn: async (saleItems: SaleItemValues[]) => {
            const { data } = await axios.post(`${BASE_API_URL}/sales/check-stock`, {
                items: saleItems
            });
            return data;
        }
    });



    // Cargar medicamentos solo los que están en la lista de items (para mostrar nombres)
    const { data: medicines } = useQuery<Medicine[]>({
        queryKey: ["medicines-for-items", items.map(i => i.medicine_id)],
        queryFn: async () => {
            // Solo cargar medicamentos que están en items
            if (items.length === 0) return [];
            const promises = items.map(item =>
                axios.get(`${BASE_API_URL}/medicines/${item.medicine_id}`)
            );
            const results = await Promise.all(promises);
            return results.map(r => r.data);
        },
        enabled: open && items.length > 0,
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

    const form = useForm<SaleFormValues>({
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



    // Agregar item desde BarcodeSearchInput
    const addItemFromBarcode = (medicine: Medicine) => {
        const existingIndex = items.findIndex(item => item.medicine_id === medicine.id);

        if (existingIndex >= 0) {
            // Actualizar cantidad si ya existe
            const updatedItems = [...items];
            updatedItems[existingIndex].quantity += 1;
            setItems(updatedItems);
        } else {
            // Agregar nuevo item
            const newItem: SaleItemValues = {
                medicine_id: medicine.id,
                quantity: 1,
                unit_price: medicine.sale_price,
                discount: 0,
            };
            setItems([...items, newItem]);
        }
    };

    // Actualizar precio de un item
    const updateItemPrice = (index: number, newPrice: number) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], unit_price: newPrice };
        setItems(updatedItems);
    };

    // Eliminar un item
    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Actualizar cantidad de un item (ahora permite exceder stock)
    const updateItemQuantity = (index: number, newQuantity: number) => {
        // Validar cantidad mínima de 1
        const validQuantity = Math.max(1, newQuantity);

        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], quantity: validQuantity };
        setItems(updatedItems);
    };



    // Medicamentos cargados para lookups
    const allMedicinesMap = new Map<number, Medicine>();
    medicines?.forEach(m => allMedicinesMap.set(m.id, m));

    // Helper para obtener medicamento por ID
    const getMedicineById = (id: number): Medicine | undefined => allMedicinesMap.get(id);

    // Calcular totales con IVA por producto
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price) - item.discount;
    }, 0);

    // Calcular IVA basado en cada producto
    const documentType = form.watch("document_type");
    const ivaAmount = documentType === "invoice"
        ? items.reduce((sum, item) => {
            const medicine = getMedicineById(item.medicine_id);
            const itemSubtotal = (item.quantity * item.unit_price) - item.discount;
            const productIvaRate = medicine?.iva_rate || 0;
            return sum + (itemSubtotal * productIvaRate);
        }, 0)
        : 0;
    const total = subtotal + ivaAmount;

    const onSubmit = async (data: SaleFormValues) => {
        if (items.length === 0) {
            form.setError("items", { message: "Agrega al menos un medicamento" });
            return;
        }

        if (!data.client_id || data.client_id === 0) {
            form.setError("client_id", { message: "Selecciona un cliente" });
            return;
        }

        const saleData: SaleCreateValues = {
            ...data,
            items: items,
        };

        // Verificar stock antes de crear la venta
        try {
            const stockResult = await checkStockMutation.mutateAsync(items);

            if (stockResult.has_issues) {
                // Hay problemas de stock, mostrar diálogo de confirmación
                setStockIssues(stockResult.issues);
                setPendingSaleData(saleData);
                setStockDialogOpen(true);
                return;
            }

            // Stock suficiente, crear venta normalmente
            await createSale(saleData);
            handleSaleSuccess();
        } catch (error) {
            console.error("Error al crear venta:", error);
        }
    };

    // Confirmar venta con stock insuficiente
    const handleConfirmWithInsufficientStock = async () => {
        if (!pendingSaleData) return;

        try {
            // Crear venta con auto_adjust_stock=true usando el mutation
            await createSaleWithAutoAdjust(pendingSaleData);
            setStockDialogOpen(false);
            handleSaleSuccess();
        } catch (error) {
            console.error("Error al crear venta:", error);
        }
    };

    // Limpiar después de venta exitosa
    const handleSaleSuccess = () => {
        onOpenChange(false);
        form.reset();
        setItems([]);
        setPendingSaleData(null);
        setStockIssues([]);
    };

    const getMedicineName = (medicineId: number) => {
        return getMedicineById(medicineId)?.name || "Desconocido";
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) {
                form.reset();
                setItems([]);
            }
            onOpenChange(isOpen);
        }}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
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
                            <CardHeader className="pt-3">
                                <CardTitle className="text-base">Agregar Medicamentos</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Búsqueda con código de barras */}
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Buscar por código de barras o nombre</label>
                                    <BarcodeSearchInput
                                        onMedicineSelect={addItemFromBarcode}
                                        placeholder="Escanea código de barras o escribe para buscar..."
                                        excludeIds={[]}
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Usa un escáner de código de barras o escribe el nombre del medicamento
                                    </p>
                                </div>

                                {/* Lista de items agregados */}
                                {items.length > 0 && (
                                    <div className="overflow-x-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Medicamento</TableHead>
                                                    <TableHead className="text-center w-[130px]">Cantidad</TableHead>
                                                    <TableHead className="text-right w-[85px]">Precio</TableHead>
                                                    {documentType === "invoice" && (
                                                        <TableHead className="text-right w-[45px]">IVA</TableHead>
                                                    )}
                                                    <TableHead className="text-right w-[85px]">Subtotal</TableHead>
                                                    <TableHead className="w-[40px]" />
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {items.map((item, index) => {
                                                    const medicine = getMedicineById(item.medicine_id);
                                                    const productIvaRate = medicine?.iva_rate || 0;
                                                    const currentStock = medicine?.inventory?.quantity || 0;
                                                    const exceedsStock = item.quantity > currentStock;
                                                    return (
                                                        <TableRow key={index} className={exceedsStock ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                                                            <TableCell className="align-top py-2">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-sm leading-tight">{getMedicineName(item.medicine_id)}</span>
                                                                    <span className={`text-xs ${exceedsStock ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
                                                                        Stock: {currentStock} {exceedsStock && `(falta ${item.quantity - currentStock})`}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7 shrink-0"
                                                                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        <IconMinus className="h-3 w-3" />
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                                        className={`w-12 h-7 text-center text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${exceedsStock ? "border-amber-500" : ""}`}
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-7 w-7 shrink-0"
                                                                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                                                    >
                                                                        <IconPlus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <EditablePriceCell
                                                                    value={item.unit_price}
                                                                    onChange={(newPrice) => updateItemPrice(index, newPrice)}
                                                                    originalValue={medicine?.sale_price}
                                                                />
                                                            </TableCell>
                                                            {documentType === "invoice" && (
                                                                <TableCell className="text-right">
                                                                    <span className={productIvaRate > 0 ? "text-amber-600" : "text-green-600"}>
                                                                        {(productIvaRate * 100).toFixed(0)}%
                                                                    </span>
                                                                </TableCell>
                                                            )}
                                                            <TableCell className="text-right whitespace-nowrap">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                                                            <TableCell>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => removeItem(index)}
                                                                    className="h-7 w-7 text-red-600"
                                                                >
                                                                    <IconTrash className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
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
                            <Button type="submit" disabled={isCreating || checkStockMutation.isPending || items.length === 0}>
                                {isCreating || checkStockMutation.isPending ? "Verificando..." : "Crear Venta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

            {/* Diálogo de confirmación de stock insuficiente */}
            <StockConfirmationDialog
                open={stockDialogOpen}
                onOpenChange={setStockDialogOpen}
                stockIssues={stockIssues}
                onConfirm={handleConfirmWithInsufficientStock}
                onCancel={() => {
                    setStockDialogOpen(false);
                    setPendingSaleData(null);
                }}
                isLoading={isCreating}
            />
        </Dialog>
    );
}

export default CreateSaleDialog;