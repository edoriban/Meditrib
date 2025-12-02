import { useState, useEffect, useRef, useCallback } from "react";
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface EditSaleSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sale: Sale | null;
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

export function EditSaleSheet({ open, onOpenChange, sale }: EditSaleSheetProps) {
    const { updateSale } = useSaleMutations();
    const [items, setItems] = useState<SaleItemValues[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<number>(0);
    const [itemQuantity, setItemQuantity] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const editability = sale ? canEditSale(sale) : { canEdit: false, reason: "" };
    const productEditability = sale ? canEditProducts(sale) : { canEdit: false, reason: "" };

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

    // Cargar medicamentos solo los que están en la lista de items (para mostrar nombres)
    const { data: medicines } = useQuery<Medicine[]>({
        queryKey: ["medicines-for-items", items.map(i => i.medicine_id)],
        queryFn: async () => {
            if (items.length === 0) return [];
            const promises = items.map(item => 
                axios.get(`${BASE_API_URL}/medicines/${item.medicine_id}`)
            );
            const results = await Promise.all(promises);
            return results.map(r => r.data);
        },
        enabled: open && items.length > 0,
    });

    // Búsqueda de medicamentos en servidor para el selector manual
    const { data: searchResults, isLoading: isSearching } = useQuery<Medicine[]>({
        queryKey: ["medicine-manual-search-sheet", searchQuery],
        queryFn: async () => {
            if (!searchQuery || searchQuery.length < 2) return [];
            const params = new URLSearchParams({
                page: "1",
                page_size: "20",
                search: searchQuery,
                stock_filter: "all"
            });
            const { data } = await axios.get(`${BASE_API_URL}/medicines/paginated?${params}`);
            return data.items || [];
        },
        enabled: searchQuery.length >= 2,
        staleTime: 1000,
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
            payment_method: "",
            notes: "",
            items: [],
        },
    });

    // Cargar items de la venta cuando se abre el sheet
    useEffect(() => {
        if (open && sale?.items) {
            const saleItems: SaleItemValues[] = sale.items.map(item => ({
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                discount: item.discount,
            }));
            setItems(saleItems);
            
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

    // Limpiar estado al cerrar
    useEffect(() => {
        if (!open) {
            setItems([]);
            setSelectedMedicine(0);
            setItemQuantity(1);
            setSearchQuery("");
            setShowDropdown(false);
            // Forzar limpieza de pointer-events en caso de que Radix no lo haga
            document.body.style.pointerEvents = '';
        }
    }, [open]);

    // Handler de cierre con limpieza
    const handleClose = useCallback((newOpen: boolean) => {
        if (!newOpen) {
            // Limpiar antes de cerrar
            setShowDropdown(false);
            setTimeout(() => {
                document.body.style.pointerEvents = '';
            }, 50);
        }
        onOpenChange(newOpen);
    }, [onOpenChange]);

    // Agregar un item a la lista
    const addItem = () => {
        if (!selectedMedicine || itemQuantity <= 0 || !productEditability.canEdit) return;
        
        const medicine = searchResults?.find(m => m.id === selectedMedicine);
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
        setSearchQuery("");
    };

    // Eliminar un item
    const removeItem = (index: number) => {
        if (!productEditability.canEdit) return;
        setItems(items.filter((_, i) => i !== index));
    };

    // Combinar medicamentos de items cargados + resultados de búsqueda para lookups
    const allMedicinesMap = new Map<number, Medicine>();
    medicines?.forEach(m => allMedicinesMap.set(m.id, m));
    searchResults?.forEach(m => allMedicinesMap.set(m.id, m));
    
    const getMedicineById = (id: number): Medicine | undefined => allMedicinesMap.get(id);

    // Actualizar cantidad de un item
    const updateItemQuantity = (index: number, newQuantity: number) => {
        if (!productEditability.canEdit) return;
        const item = items[index];
        const medicine = getMedicineById(item.medicine_id);
        const maxStock = medicine?.inventory?.quantity || 999;
        
        const validQuantity = Math.max(1, Math.min(newQuantity, maxStock));
        
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], quantity: validQuantity };
        setItems(updatedItems);
    };

    // Filtrar medicamentos de búsqueda (excluyendo ya agregados)
    const filteredMedicines = (searchResults || []).filter(medicine => {
        const isAlreadyAdded = items.some(item => item.medicine_id === medicine.id);
        return !isAlreadyAdded;
    });

    // Calcular totales con IVA por producto
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price) - item.discount;
    }, 0);

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
        if (!editability.canEdit || !sale) return;
        
        if (items.length === 0) {
            form.setError("items", { message: "Agrega al menos un medicamento" });
            return;
        }

        const updateData = {
            ...data,
            items: productEditability.canEdit ? items : undefined,
        };

        await updateSale(sale.id, updateData);
        handleClose(false);
    };

    const getMedicineName = (medicineId: number) => {
        return getMedicineById(medicineId)?.name || "Cargando...";
    };

    if (!sale) return null;

    return (
        <Sheet open={open} onOpenChange={handleClose} modal={true}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
                <SheetHeader className="pb-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        Editar Pedido #{sale.id.toString().padStart(4, '0')}
                        {!editability.canEdit && <IconLock className="h-4 w-4 text-muted-foreground" />}
                    </SheetTitle>
                    <SheetDescription>
                        Modifica los datos del pedido. Los cambios en productos afectarán el inventario.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="py-4 space-y-4">
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
                            <form id="edit-sale-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Información del cliente y documento */}
                                <div className="grid grid-cols-2 gap-3">
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
                                <div className="grid grid-cols-3 gap-3">
                                    <FormField
                                        control={form.control}
                                        name="payment_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado Pago</FormLabel>
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
                                                <FormLabel>Estado Envío</FormLabel>
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
                                                <FormLabel>Método Pago</FormLabel>
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

                                {/* Productos */}
                                <Card className={!productEditability.canEdit ? "opacity-60" : ""}>
                                    <CardHeader className="py-2 px-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm">Productos del Pedido</CardTitle>
                                            {!productEditability.canEdit && (
                                                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                                                    <IconLock className="h-3 w-3" />
                                                    Bloqueado
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 px-3 pb-3">
                                        {productEditability.canEdit && (
                                            <div className="flex gap-2 items-end">
                                                <div className="flex-1 relative" ref={dropdownRef}>
                                                    <label className="text-xs font-medium">Agregar Medicamento</label>
                                                    <div className="relative">
                                                        <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground z-10" />
                                                        <Input
                                                            placeholder="Buscar..."
                                                            value={searchQuery}
                                                            onChange={(e) => {
                                                                setSearchQuery(e.target.value);
                                                                setShowDropdown(true);
                                                                if (!e.target.value) {
                                                                    setSelectedMedicine(0);
                                                                }
                                                            }}
                                                            onFocus={() => setShowDropdown(true)}
                                                            className="pl-7 h-8 text-sm"
                                                        />
                                                        
                                                        {showDropdown && (
                                                            <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                                                                {isSearching ? (
                                                                    <div className="py-3 px-3 text-center text-xs text-muted-foreground">
                                                                        Buscando...
                                                                    </div>
                                                                ) : filteredMedicines.length === 0 ? (
                                                                    <div className="py-3 px-3 text-center text-xs text-muted-foreground">
                                                                        {searchQuery.length < 2 ? "Escribe 2+ caracteres" : "Sin resultados"}
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
                                                                            className={`flex flex-col px-3 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground ${
                                                                                selectedMedicine === medicine.id ? "bg-accent" : ""
                                                                            }`}
                                                                        >
                                                                            <span className="text-sm">{medicine.name}</span>
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
                                                <div className="w-16">
                                                    <label className="text-xs font-medium">Cant.</label>
                                                    <Input 
                                                        type="number" 
                                                        min="1"
                                                        value={itemQuantity}
                                                        onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                                        onFocus={() => setShowDropdown(false)}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    onClick={() => {
                                                        addItem();
                                                        setSearchQuery("");
                                                        setShowDropdown(false);
                                                    }} 
                                                    disabled={!selectedMedicine}
                                                    size="sm"
                                                    className="h-8"
                                                >
                                                    <IconPlus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {/* Lista de items */}
                                        {items.length > 0 && (
                                            <div className="border rounded-md">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-xs py-2">Producto</TableHead>
                                                            <TableHead className="text-xs py-2 text-center w-[90px]">Cant.</TableHead>
                                                            <TableHead className="text-xs py-2 text-right w-[70px]">Precio</TableHead>
                                                            <TableHead className="text-xs py-2 text-right w-[70px]">Subtotal</TableHead>
                                                            {productEditability.canEdit && <TableHead className="w-[32px]" />}
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {items.map((item, index) => {
                                                            const medicine = getMedicineById(item.medicine_id);
                                                            return (
                                                                <TableRow key={index}>
                                                                    <TableCell className="py-1.5">
                                                                        <div className="flex flex-col">
                                                                            <span className="text-xs leading-tight">{getMedicineName(item.medicine_id)}</span>
                                                                            <span className="text-[10px] text-muted-foreground">
                                                                                Stock: {medicine?.inventory?.quantity || 0}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-1.5">
                                                                        {productEditability.canEdit ? (
                                                                            <div className="flex items-center justify-center gap-0.5">
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6"
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
                                                                                    className="w-10 h-6 text-center text-xs px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                                />
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="icon"
                                                                                    className="h-6 w-6"
                                                                                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                                                                >
                                                                                    <IconPlus className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-center text-xs">{item.quantity}</div>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="py-1.5 text-right text-xs">{formatCurrency(item.unit_price)}</TableCell>
                                                                    <TableCell className="py-1.5 text-right text-xs font-medium">{formatCurrency(item.quantity * item.unit_price)}</TableCell>
                                                                    {productEditability.canEdit && (
                                                                        <TableCell className="py-1.5">
                                                                            <Button 
                                                                                type="button" 
                                                                                variant="ghost" 
                                                                                size="icon"
                                                                                onClick={() => removeItem(index)}
                                                                                className="h-6 w-6 text-red-600"
                                                                            >
                                                                                <IconTrash className="h-3 w-3" />
                                                                            </Button>
                                                                        </TableCell>
                                                                    )}
                                                                </TableRow>
                                                            );
                                                        })}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}

                                        {items.length === 0 && (
                                            <p className="text-xs text-muted-foreground text-center py-3">
                                                No hay medicamentos en este pedido
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Totales */}
                                <div className="bg-muted/50 rounded-md p-3 space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {documentType === "invoice" && ivaAmount > 0 && (
                                        <div className="flex justify-between text-amber-600 text-xs">
                                            <span>IVA (productos gravados):</span>
                                            <span>{formatCurrency(ivaAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-base border-t pt-1">
                                        <span>Total:</span>
                                        <span>{formatCurrency(total)}</span>
                                    </div>
                                </div>

                                {/* Notas */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Notas (opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Notas adicionales..."
                                                    className="text-sm min-h-[60px]"
                                                    {...field}
                                                    disabled={!editability.canEdit}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </div>
                </ScrollArea>

                <SheetFooter className="pt-4 border-t gap-2">
                    <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                        {editability.canEdit ? "Cancelar" : "Cerrar"}
                    </Button>
                    {editability.canEdit && (
                        <Button 
                            type="submit" 
                            form="edit-sale-form"
                            disabled={form.formState.isSubmitting || items.length === 0}
                        >
                            {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

export default EditSaleSheet;
