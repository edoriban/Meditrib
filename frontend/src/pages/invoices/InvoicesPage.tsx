import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Invoice, Company } from "@/types/invoice";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconFileInvoice, IconDownload, IconEye, IconTrash, IconTrendingUp, IconCheck, IconClock, IconX, IconPlus } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'issued':
            return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Emitida</Badge>;
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pendiente</Badge>;
        case 'cancelled':
            return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelada</Badge>;
        case 'draft':
            return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Borrador</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export default function InvoicesPage() {
    const queryClient = useQueryClient();
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const { data: invoices, isLoading } = useQuery<Invoice[]>({
        queryKey: ["invoices"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/invoices/`);
            return data;
        },
    });

    const { data: companies } = useQuery<Company[]>({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/invoices/companies/`);
            return data;
        },
    });

    const generateXmlMutation = useMutation({
        mutationFn: (invoiceId: number) => axios.post(`${BASE_API_URL}/invoices/${invoiceId}/generate-xml`),
        onSuccess: (response, invoiceId) => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            // Download XML file
            const blob = new Blob([response.data.xml], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `CFDI_${invoiceId}.xml`;
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success("CFDI generado exitosamente");
        },
        onError: () => {
            toast.error("Error al generar CFDI");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (invoiceId: number) => axios.delete(`${BASE_API_URL}/invoices/${invoiceId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            toast.success("Factura eliminada");
        },
        onError: () => {
            toast.error("Error al eliminar factura");
        },
    });

    const issuedCount = invoices?.filter(i => i.status === 'issued').length || 0;
    const pendingCount = invoices?.filter(i => i.status === 'pending' || i.status === 'draft').length || 0;
    const cancelledCount = invoices?.filter(i => i.status === 'cancelled').length || 0;
    const totalAmount = invoices?.filter(i => i.status === 'issued').reduce((sum, i) => sum + i.total, 0) || 0;

    const handleViewDetails = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setShowDetailDialog(true);
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Facturación CFDI</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona facturas electrónicas y generación de CFDI.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                            <IconPlus className="mr-1 h-4 w-4" />
                            Nueva Factura
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Facturado</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {formatCurrency(totalAmount)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-green-600">
                                <IconTrendingUp className="size-4" />
                                Emitidas
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Facturas vigentes <IconTrendingUp className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            {issuedCount} facturas emitidas
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Emitidas</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                            {issuedCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-green-600">
                                <IconCheck className="size-4" />
                                Activas
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Con timbrado SAT <IconCheck className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            CFDI válidos
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Pendientes</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${pendingCount > 0 ? 'text-amber-600' : ''}`}>
                            {pendingCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-amber-600">
                                <IconClock className="size-4" />
                                Por emitir
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Requieren timbrado <IconClock className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Borradores y pendientes
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Canceladas</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${cancelledCount > 0 ? 'text-red-600' : ''}`}>
                            {cancelledCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-red-600">
                                <IconX className="size-4" />
                                Canceladas
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Sin validez fiscal <IconX className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Canceladas ante SAT
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Company Info */}
            {companies && companies.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Datos del Emisor</CardTitle>
                        <CardDescription>Información fiscal de la empresa</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Razón Social</span>
                                <p className="font-medium">{companies[0].name}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">RFC</span>
                                <p className="font-medium">{companies[0].rfc}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Régimen Fiscal</span>
                                <p className="font-medium">{companies[0].tax_regime}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Invoices Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Facturas</CardTitle>
                    <CardDescription>Todas las facturas registradas en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando facturas...</div>
                    ) : !invoices || invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                <IconFileInvoice className="h-8 w-8 text-gray-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Sin facturas</h3>
                            <p className="text-sm text-muted-foreground">
                                No hay facturas registradas. Crea una desde una venta.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Serie/Folio</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                    <TableHead>IVA</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            {invoice.serie}-{invoice.folio || invoice.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{invoice.client?.name || 'N/A'}</p>
                                                <p className="text-xs text-muted-foreground">{invoice.client?.rfc || 'Sin RFC'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invoice.issue_date).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>
                                        <TableCell>{formatCurrency(invoice.total_taxes)}</TableCell>
                                        <TableCell className="font-semibold">{formatCurrency(invoice.total)}</TableCell>
                                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewDetails(invoice)}
                                                    title="Ver detalles"
                                                >
                                                    <IconEye className="h-4 w-4" />
                                                </Button>
                                                {invoice.status !== 'cancelled' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => generateXmlMutation.mutate(invoice.id)}
                                                        disabled={generateXmlMutation.isPending}
                                                        title="Generar/Descargar XML"
                                                    >
                                                        <IconDownload className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {invoice.status === 'draft' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteMutation.mutate(invoice.id)}
                                                        disabled={deleteMutation.isPending}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Eliminar"
                                                    >
                                                        <IconTrash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Invoice Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Factura {selectedInvoice?.serie}-{selectedInvoice?.folio || selectedInvoice?.id}
                        </DialogTitle>
                        <DialogDescription>
                            Detalles de la factura electrónica
                        </DialogDescription>
                    </DialogHeader>

                    {selectedInvoice && (
                        <div className="space-y-4">
                            {selectedInvoice.uuid && (
                                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-xs text-green-600 font-medium">UUID (Folio Fiscal)</span>
                                    <p className="font-mono text-sm">{selectedInvoice.uuid}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Tipo de Comprobante</span>
                                    <p className="font-medium">{selectedInvoice.invoice_type}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Estado</span>
                                    <div className="mt-1">{getStatusBadge(selectedInvoice.status)}</div>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Forma de Pago</span>
                                    <p className="font-medium">{selectedInvoice.payment_form}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Método de Pago</span>
                                    <p className="font-medium">{selectedInvoice.payment_method}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Receptor</h4>
                                <p className="font-medium">{selectedInvoice.client?.name}</p>
                                <p className="text-sm text-muted-foreground">RFC: {selectedInvoice.client?.rfc}</p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-2">Conceptos</h4>
                                <div className="space-y-2">
                                    {selectedInvoice.concepts?.map((concept, index) => (
                                        <div key={index} className="flex justify-between p-2 bg-muted rounded">
                                            <div>
                                                <p className="font-medium">{concept.description}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {concept.quantity} {concept.unit} × {formatCurrency(concept.unit_price)}
                                                </p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(concept.amount)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-1">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between mb-1 text-green-600">
                                        <span>Descuento</span>
                                        <span>-{formatCurrency(selectedInvoice.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between mb-1">
                                    <span>IVA (16%)</span>
                                    <span>{formatCurrency(selectedInvoice.total_taxes)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total</span>
                                    <span>{formatCurrency(selectedInvoice.total)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                            Cerrar
                        </Button>
                        {selectedInvoice && selectedInvoice.status !== 'cancelled' && (
                            <Button onClick={() => {
                                generateXmlMutation.mutate(selectedInvoice.id);
                                setShowDetailDialog(false);
                            }}>
                                <IconDownload className="mr-1 h-4 w-4" />
                                Descargar XML
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Invoice Dialog */}
            <CreateInvoiceDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />
        </div>
    );
}
