import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Sale, SaleItemValues, saleFormSchema, SaleFormValues } from "@/types/sales";
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
import { IconPlus, IconTrash, IconAlertTriangle, IconLock, IconMinus, IconSearch } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface EditSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

// Verificar si la venta puede ser editada
const canEditSale = (sale: Sale): { canEdit: boolean; reason: string } => {
    if (sale.shipping_status === "delivered") {
        return { canEdit: false, reason: "No se puede editar una venta ya entregada" };
    }
    if (sale.shipping_status === "canceled") {
        return { canEdit: false, reason: "No se puede editar una venta cancelada" };
    }
    if (sale.payment_status === "refunded") {
        return { canEdit: false, reason: "No se puede editar una venta reembolsada" };
    }
    return { canEdit: true, reason: "" };
};

// Verificar si se pueden modificar los productos (más restrictivo)
const canEditProducts = (sale: Sale): { canEdit: boolean; reason: string } => {
    if (sale.shipping_status === "shipped") {
        return { canEdit: false, reason: "No se pueden modificar productos de un pedido ya enviado" };
    }
    if (sale.payment_status === "paid") {
        return { canEdit: false, reason: "No se pueden modificar productos de una venta ya pagada. Considera hacer un reembolso parcial." };
    }
    return canEditSale(sale);
};

export function EditSaleDialog({ open, onOpenChange, sale }: EditSaleDialogProps) {
    const { updateSale } = useSaleMutations();
    const [items, setItems] = useState<SaleItemValues[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<number>(0);
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const editability = canEditSale(sale);
    const productEditability = canEditProducts(sale);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const form = useForm<SaleFormValues>({
        resolver: zodResolver(saleFormSchema),
        defaultValues: {
            client_id: sale.client_id,
            user_id: sale.user_id,
            document_type: sale.document_type as "invoice" | "remission",
            iva_rate: sale.iva_rate,
            shipping_status: sale.shipping_status,
            payment_status: sale.payment_status,
            payment_method: sale.payment_method || "",
            notes: sale.notes || "",
            items: [],
        },
    });

    // Cargar items de la venta cuando se abre el diálogo
    useEffect(() => {
        if (open && sale.items) {
            const saleItems: SaleItemValues[] = sale.items.map(item => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount,
            }));
            setItems(saleItems);
            
            // Resetear el form con los valores de la venta
            form.reset({
                client_id: sale.client_id,
                user_id: sale.user_id,
                document_type: sale.document_type as "invoice" | "remission",
                iva_rate: sale.iva_rate,
                shipping_status: sale.shipping_status,
                payment_status: sale.payment_status,
                payment_method: sale.payment_method || "",
                notes: sale.notes || "",
                items: [],
            });
        }
    }, [open, sale, form]);

    // Agregar un item a la lista
    const addItem = () => {
        if (!selectedMedicine || itemQuantity <= 0 || !productEditability.canEdit) return;
        
        const medicine = medicines?.find(m => m.id === selectedMedicine);
        if (!medicine) return;

        const existingIndex = items.findIndex(item => item.medicine_id === selectedMedicine);
        
        if (existingIndex >= 0) {
            const updatedItems = [...items];
            updatedItems[existingIndex].quantity += itemQuantity;
            setItems(updatedItems);
        } else {
            const newItem: SaleItemValues = {
                medicine_id: selectedMedicine,
                quantity: itemQuantity,
                unit_price: medicine.sale_price,
                discount: 0,
            };
            setItems([...items, newItem]);
        }

        setSelectedMedicine(0);
        setItemQuantity(1);
    };

    // Eliminar un item
    const removeItem = (index: number) => {
        if (!productEditability.canEdit) return;
        setItems(items.filter((_, i) => i !== index));
    };

    // Actualizar cantidad de un item
    const updateItemQuantity = (index: number, newQuantity: number) => {
        if (!productEditability.canEdit) return;
        const item = items[index];
        const medicine = medicines?.find(m => m.id === item.medicine_id);
        const maxStock = medicine?.inventory?.quantity || 999;
        
        // Validar cantidad entre 1 y el stock disponible
        const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
        
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], quantity: validQuantity };
        setItems(updatedItems);
    };

    // Filtrar medicamentos disponibles (no seleccionados y con stock)
    const availableMedicines = medicines?.filter(medicine => {
        // Excluir medicamentos ya agregados
        const isAlreadyAdded = items.some(item => item.medicine_id === medicine.id);
        // Solo mostrar medicamentos con stock disponible
        const hasStock = medicine.inventory && medicine.inventory.quantity > 0;
        return !isAlreadyAdded && hasStock;
    }) || [];

    // Filtrar por búsqueda
    const filteredMedicines = availableMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calcular totales con IVA por producto
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price) - item.discount;
    }, 0);

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

    const onSubmit = async (data: SaleFormValues) => {
        if (!editability.canEdit) return;
        
        if (items.length === 0) {
            form.setError("items", { message: "Agrega al menos un medicamento" });
            return;
        }

        const updateData = {
            ...data,
            items: productEditability.canEdit ? items : undefined, // Solo enviar items si se pueden editar
        };

        await updateSale(sale.id, updateData);
        onOpenChange(false);
    };

    const getMedicineName = (medicineId: number) => {
        return medicines?.find(m => m.id === medicineId)?.name || "Desconocido";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Editar Pedido #{sale.id.toString().padStart(4, '0')}
                        {!editability.canEdit && <IconLock className="h-4 w-4 text-muted-foreground" />}
                    </DialogTitle>
                    <DialogDescription>
                        Modifica los datos del pedido. Los cambios en productos afectarán el inventario.
                    </DialogDescription>
                </DialogHeader>

                {/* Alerta si no se puede editar */}
                {!editability.canEdit && (
                    <Alert variant="destructive">
                        <IconAlertTriangle className="h-4 w-4" />
                        <AlertTitle>Venta bloqueada</AlertTitle>
                        <AlertDescription>{editability.reason}</AlertDescription>
                    </Alert>
                )}

                {/* Alerta si no se pueden editar productos pero sí estados */}
                {editability.canEdit && !productEditability.canEdit && (
                    <Alert>
                        <IconAlertTriangle className="h-4 w-4" />
                        <AlertTitle>Edición limitada</AlertTitle>
                        <AlertDescription>
                            {productEditability.reason}. Solo puedes modificar estados y notas.
                        </AlertDescription>
                    </Alert>
                )}
                
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
                                            disabled={!editability.canEdit}
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
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                            disabled={!productEditability.canEdit}
                                        >
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

                        {/* Estados */}
                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="payment_status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado de Pago</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                            disabled={!editability.canEdit}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="partial">Parcial</SelectItem>
                                                <SelectItem value="paid">Pagado</SelectItem>
                                                <SelectItem value="refunded">Reembolsado</SelectItem>
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
                                        <FormLabel>Estado de Envío</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value}
                                            disabled={!editability.canEdit}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="pending">Pendiente</SelectItem>
                                                <SelectItem value="shipped">Enviado</SelectItem>
                                                <SelectItem value="delivered">Entregado</SelectItem>
                                                <SelectItem value="canceled">Cancelado</SelectItem>
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
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value || ""}
                                            disabled={!editability.canEdit}
                                        >
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

                        {/* Productos - Solo si se pueden editar */}
                        <Card className={!productEditability.canEdit ? "opacity-60" : ""}>
                            <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">Productos del Pedido</CardTitle>
                                    {!productEditability.canEdit && (
                                        <Badge variant="secondary" className="flex items-center gap-1">
                                            <IconLock className="h-3 w-3" />
                                            Bloqueado
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {productEditability.canEdit && (
                                    <div className="flex gap-2 items-end">
                                        {/* Input con autocompletado */}
                                        <div className="flex-1 relative" ref={dropdownRef}>
                                            <label className="text-sm font-medium">Agregar Medicamento</label>
                                            <div className="relative">
                                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                                <Input
                                                    placeholder="Escribe para buscar..."
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setShowDropdown(true);
                                                        if (!e.target.value) {
                                                            setSelectedMedicine(0);
                                                        }
                                                    }}
                                                    onFocus={() => setShowDropdown(true)}
                                                    className="pl-9"
                                                />
                                                
                                                {/* Dropdown de resultados */}
                                                {showDropdown && (
                                                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[250px] overflow-y-auto">
                                                        {filteredMedicines.length === 0 ? (
                                                            <div className="py-4 px-3 text-center text-sm text-muted-foreground">
                                                                {searchQuery ? "No se encontraron medicamentos" : "Escribe para buscar medicamentos"}
                                                            </div>
                                                        ) : (
                                                            filteredMedicines.map((medicine) => (
                                                                <div
                                                                    key={medicine.id}
                                                                    onClick={() => {
                                                                        setSelectedMedicine(medicine.id);
                                                                        setSearchQuery(medicine.name);
                                                                        setShowDropdown(false);
                                                                    }}
                                                                    className={`flex flex-col px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                                                                        selectedMedicine === medicine.id ? "bg-accent" : ""
                                                                    }`}
                                                                >
                                                                    <span className="font-medium">{medicine.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatCurrency(medicine.sale_price)} · Stock: {medicine.inventory?.quantity || 0}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-24">
                                            <label className="text-sm font-medium">Cantidad</label>
                                            <Input 
                                                type="number" 
                                                min="1"
                                                max={medicines?.find(m => m.id === selectedMedicine)?.inventory?.quantity || 999}
                                                value={itemQuantity}
                                                onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                                onFocus={() => setShowDropdown(false)}
                                            />
                                        </div>
                                        <Button type="button" onClick={() => {
                                            addItem();
                                            setSearchQuery("");
                                            setShowDropdown(false);
                                        }} disabled={!selectedMedicine}>
                                            <IconPlus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}

                                {/* Lista de items */}
                                {items.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Medicamento</TableHead>
                                                <TableHead className="text-center w-40">Cantidad</TableHead>
                                                <TableHead className="text-right">Precio</TableHead>
                                                <TableHead className="text-right">IVA</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                {productEditability.canEdit && <TableHead className="w-10" />}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item, index) => {
                                                const medicine = medicines?.find(m => m.id === item.medicine_id);
                                                const productIvaRate = medicine?.iva_rate || 0;
                                                return (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{getMedicineName(item.medicine_id)}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    Stock disponible: {medicine?.inventory?.quantity || 0}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {productEditability.canEdit ? (
                                                                <div className="flex items-center justify-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                                                        disabled={item.quantity <= 1}
                                                                    >
                                                                        <IconMinus className="h-4 w-4" />
                                                                    </Button>
                                                                    <Input
                                                                        type="number"
                                                                        min={1}
                                                                        max={medicine?.inventory?.quantity || 999}
                                                                        value={item.quantity}
                                                                        onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                                        className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                                                        disabled={item.quantity >= (medicine?.inventory?.quantity || 999)}
                                                                    >
                                                                        <IconPlus className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">{item.quantity}</div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={productIvaRate > 0 ? "text-amber-600" : "text-green-600"}>
                                                                {(productIvaRate * 100).toFixed(0)}%
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                                                        {productEditability.canEdit && (
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
                                                        )}
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                )}

                                {items.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        No hay medicamentos en este pedido
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
                                            disabled={!editability.canEdit}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {editability.canEdit ? "Cancelar" : "Cerrar"}
                            </Button>
                            {editability.canEdit && (
                                <Button type="submit" disabled={form.formState.isSubmitting || items.length === 0}>
                                    {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default EditSaleDialog;
