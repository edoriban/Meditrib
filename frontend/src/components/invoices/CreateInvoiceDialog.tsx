import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { Sale } from "@/types/sales";
import { Client, canClientInvoice } from "@/types/clients";
import { PAYMENT_FORMS, PAYMENT_METHODS, getPaymentFormLabel, getPaymentMethodLabel } from "@/types/sat-catalogs";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InvoiceValidationDialog } from "./InvoiceValidationDialog";
import {
    IconFileInvoice,
    IconAlertTriangle,
    IconCheck,
    IconReceipt,
    IconUser,
    IconPackage,
    IconLoader2
} from "@tabler/icons-react";
import { toast } from "sonner";

interface CreateInvoiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateInvoiceDialog({
    open,
    onOpenChange,
    onSuccess
}: CreateInvoiceDialogProps) {
    const queryClient = useQueryClient();
    const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);
    const [paymentForm, setPaymentForm] = useState("01"); // Efectivo
    const [paymentMethod, setPaymentMethod] = useState("PUE"); // Pago en una sola exhibición
    const [showValidationDialog, setShowValidationDialog] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    // Verificar si hay empresa emisora configurada
    const { data: companies, isLoading: companiesLoading } = useQuery<{ id: number; name: string; rfc: string }[]>({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/companies/`);
            return data;
        },
        enabled: open,
    });

    const hasCompanyConfigured = companies && companies.length > 0;
    const company = companies?.[0];

    // Obtener ventas que pueden ser facturadas (remisiones e invoices sin invoice_id)
    const { data: sales, isLoading: salesLoading } = useQuery<Sale[]>({
        queryKey: ["sales-for-invoice"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/sales/`);
            // Filtrar ventas que no tienen invoice asignado
            return data.filter((sale: Sale) => !sale.invoice);
        },
        enabled: open,
    });

    // Obtener cliente seleccionado
    const { data: clientData } = useQuery<Client>({
        queryKey: ["client-for-invoice", selectedSaleId],
        queryFn: async () => {
            const sale = sales?.find(s => s.id === selectedSaleId);
            if (!sale) throw new Error("Sale not found");
            const { data } = await axios.get(`${BASE_API_URL}/clients/${sale.client_id}`);
            return data;
        },
        enabled: !!selectedSaleId && !!sales,
    });

    useEffect(() => {
        if (clientData) {
            setSelectedClient(clientData);
        }
    }, [clientData]);

    // Mutación para crear factura
    const createInvoiceMutation = useMutation({
        mutationFn: async () => {
            if (!selectedSaleId) throw new Error("No sale selected");
            const { data } = await axios.post(
                `${BASE_API_URL}/invoices/from-sale/${selectedSaleId}`,
                null,
                { params: { payment_form: paymentForm, payment_method: paymentMethod } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["sales-for-invoice"] });
            toast.success("Factura creada exitosamente");
            handleClose();
            onSuccess?.();
        },
        onError: (error: unknown) => {
            // Manejar errores de axios con mensaje del servidor
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else if (error instanceof Error) {
                toast.error(`Error al crear factura: ${error.message}`);
            } else {
                toast.error("Error al crear factura");
            }
        }
    });

    const handleClose = () => {
        setSelectedSaleId(null);
        setPaymentForm("01");
        setPaymentMethod("PUE");
        setSelectedClient(null);
        onOpenChange(false);
    };

    const handleCreateInvoice = () => {
        if (!selectedClient) return;

        // Verificar si el cliente puede facturar
        if (!canClientInvoice(selectedClient)) {
            setShowValidationDialog(true);
            return;
        }

        // Cliente tiene datos fiscales completos, crear factura
        createInvoiceMutation.mutate();
    };

    const handleValidationSuccess = () => {
        setShowValidationDialog(false);
        createInvoiceMutation.mutate();
    };

    const selectedSale = sales?.find(s => s.id === selectedSaleId);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount);
    };

    return (
        <>
            <Dialog open={open && !showValidationDialog} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconFileInvoice className="h-5 w-5" />
                            Crear Nueva Factura
                        </DialogTitle>
                        <DialogDescription>
                            Selecciona una venta para convertirla en factura CFDI.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Estado de configuración de empresa emisora */}
                        {companiesLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <IconLoader2 className="h-4 w-4 animate-spin" />
                                Verificando configuración...
                            </div>
                        ) : !hasCompanyConfigured ? (
                            <Alert variant="destructive">
                                <IconAlertTriangle className="h-4 w-4" />
                                <AlertTitle>Empresa emisora no configurada</AlertTitle>
                                <AlertDescription>
                                    Debes configurar los datos fiscales de tu empresa antes de poder emitir facturas.{" "}
                                    <Link
                                        to="/settings"
                                        className="underline font-medium hover:text-destructive-foreground"
                                        onClick={handleClose}
                                    >
                                        Ir a Configuración
                                    </Link>
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-green-100 text-green-700 rounded-full">
                                        <IconCheck className="h-3 w-3" />
                                    </div>
                                    <div>
                                        <span className="font-medium">{company?.name}</span>
                                        <span className="text-muted-foreground ml-2">RFC: {company?.rfc}</span>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                                    Emisor configurado
                                </Badge>
                            </div>
                        )}

                        {/* Selector de venta */}
                        <div className="space-y-2">
                            <Label htmlFor="sale">Seleccionar Venta</Label>
                            {salesLoading ? (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <IconLoader2 className="h-4 w-4 animate-spin" />
                                    Cargando ventas...
                                </div>
                            ) : sales && sales.length > 0 ? (
                                <Select
                                    value={selectedSaleId?.toString() || ""}
                                    onValueChange={(value) => setSelectedSaleId(parseInt(value))}
                                >
                                    <SelectTrigger id="sale">
                                        <SelectValue placeholder="Selecciona una venta" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sales.map((sale) => (
                                            <SelectItem key={sale.id} value={sale.id.toString()}>
                                                <div className="flex items-center gap-2">
                                                    <IconReceipt className="h-4 w-4 text-muted-foreground" />
                                                    <span>#{sale.id} - {sale.client.name}</span>
                                                    <span className="text-muted-foreground">
                                                        ({formatCurrency(sale.total)})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Alert>
                                    <IconAlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Sin ventas disponibles</AlertTitle>
                                    <AlertDescription>
                                        No hay ventas disponibles para facturar.
                                        Crea una venta primero para poder generar su factura CFDI.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {/* Detalles de la venta seleccionada */}
                        {selectedSale && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Detalles de la Venta</h4>

                                    <div className="flex items-center gap-2 text-sm">
                                        <IconUser className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Cliente:</span>
                                        <span className="font-medium">{selectedSale.client.name}</span>
                                    </div>

                                    {/* Items de la venta */}
                                    <div className="rounded-lg border p-3 space-y-2 max-h-48 overflow-y-auto">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <IconPackage className="h-4 w-4" />
                                            Productos ({selectedSale.items.length})
                                        </div>
                                        {selectedSale.items.map((item) => {
                                            // Calcular el IVA que se agregaría a este item
                                            const itemIvaRate = item.product.iva_rate || 0;
                                            const itemIvaAmount = item.subtotal * itemIvaRate;
                                            const itemTotalWithIva = item.subtotal + itemIvaAmount;

                                            return (
                                                <div key={item.id} className="flex justify-between text-sm pl-6 gap-2">
                                                    <span className="text-muted-foreground flex-1 truncate">
                                                        {item.product.name} x{item.quantity}
                                                    </span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span>{formatCurrency(itemTotalWithIva)}</span>
                                                        {itemIvaRate > 0 && (
                                                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-amber-600 border-amber-200 bg-amber-50">
                                                                IVA {(itemIvaRate * 100).toFixed(0)}%
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Resumen de totales para la FACTURA (con IVA calculado) */}
                                        <div className="border-t mt-3 pt-3 space-y-1.5">
                                            {(() => {
                                                // Calcular totales para la factura
                                                const invoiceSubtotal = selectedSale.subtotal;
                                                const invoiceIva = selectedSale.items.reduce((sum, item) => {
                                                    const itemIvaRate = item.product.iva_rate || 0;
                                                    return sum + (item.subtotal * itemIvaRate);
                                                }, 0);
                                                const invoiceTotal = invoiceSubtotal + invoiceIva;

                                                return (
                                                    <>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-muted-foreground">Subtotal:</span>
                                                            <span>{formatCurrency(invoiceSubtotal)}</span>
                                                        </div>
                                                        {invoiceIva > 0 && (
                                                            <div className="flex justify-between text-sm text-amber-600">
                                                                <span>IVA:</span>
                                                                <span>+{formatCurrency(invoiceIva)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between text-sm font-medium">
                                                            <span>Total Factura:</span>
                                                            <span>{formatCurrency(invoiceTotal)}</span>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Estado del cliente para facturación */}
                                    {selectedClient && (
                                        <div className="flex items-center gap-2">
                                            {canClientInvoice(selectedClient) ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                                    <IconCheck className="h-3 w-3 mr-1" />
                                                    Datos fiscales completos
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                                    <IconAlertTriangle className="h-3 w-3 mr-1" />
                                                    Requiere datos fiscales
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Configuración de pago */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="paymentForm">Forma de Pago</Label>
                                        <Select value={paymentForm} onValueChange={setPaymentForm}>
                                            <SelectTrigger id="paymentForm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_FORMS.map((form) => (
                                                    <SelectItem key={form.code} value={form.code}>
                                                        {getPaymentFormLabel(form.code)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="paymentMethod">Método de Pago</Label>
                                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <SelectTrigger id="paymentMethod">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PAYMENT_METHODS.map((method) => (
                                                    <SelectItem key={method.code} value={method.code}>
                                                        {getPaymentMethodLabel(method.code)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateInvoice}
                            disabled={!selectedSaleId || !hasCompanyConfigured || createInvoiceMutation.isPending}
                        >
                            {createInvoiceMutation.isPending ? (
                                <>
                                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <IconFileInvoice className="h-4 w-4 mr-2" />
                                    Crear Factura
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de validación fiscal */}
            {selectedClient && (
                <InvoiceValidationDialog
                    open={showValidationDialog}
                    onOpenChange={setShowValidationDialog}
                    client={selectedClient}
                    onValidationSuccess={handleValidationSuccess}
                    onCancel={() => setShowValidationDialog(false)}
                />
            )}
        </>
    );
}

export default CreateInvoiceDialog;
