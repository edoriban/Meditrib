import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Invoice } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, Plus } from "lucide-react";
import { BASE_API_URL } from "@/config";

const getStatusColor = (status: string) => {
    switch (status) {
        case 'draft':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'issued':
            return 'bg-green-100 text-green-800 border-green-300';
        case 'cancelled':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

export function InvoicesList() {
    const queryClient = useQueryClient();

    const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
        queryKey: ["invoices"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/invoices/`);
            return data;
        },
    });

    const generateXmlMutation = useMutation({
        mutationFn: (invoiceId: number) =>
            axios.post(`${BASE_API_URL}/invoices/${invoiceId}/generate-xml`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
        },
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Facturas CFDI
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Cargando facturas...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Facturas CFDI
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-red-600">
                        Error al cargar facturas
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Facturas CFDI ({invoices?.length || 0})
                    </CardTitle>
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva Factura
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!invoices || invoices.length === 0 ? (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay facturas registradas</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Crea tu primera factura CFDI para comenzar
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Serie-Folio</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono">
                                        {invoice.serie}-{invoice.folio}
                                        {invoice.uuid && (
                                            <div className="text-xs text-muted-foreground">
                                                UUID: {invoice.uuid.substring(0, 8)}...
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>{invoice.client.name}</TableCell>
                                    <TableCell>
                                        {new Date(invoice.issue_date).toLocaleDateString('es-ES')}
                                    </TableCell>
                                    <TableCell className="font-mono">
                                        ${invoice.total.toFixed(2)} {invoice.currency}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                                            {invoice.status.toUpperCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {invoice.status === 'draft' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => generateXmlMutation.mutate(invoice.id)}
                                                    disabled={generateXmlMutation.isPending}
                                                >
                                                    {generateXmlMutation.isPending ? "Generando..." : "Generar XML"}
                                                </Button>
                                            )}
                                            {invoice.cfdi_xml && (
                                                <Button variant="outline" size="sm">
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Descargar
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
    );
}