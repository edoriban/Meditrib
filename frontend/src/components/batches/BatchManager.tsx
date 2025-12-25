import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProductBatch, ExpiringBatch, BatchInventorySummary } from "@/types/batches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, AlertTriangle, Calendar, TrendingDown, DollarSign } from "lucide-react";
import { BASE_API_URL } from "@/config";

const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
        return { status: "expired", color: "bg-red-100 text-red-800", label: "Expirado" };
    } else if (daysUntilExpiry <= 30) {
        return { status: "expiring", color: "bg-yellow-100 text-yellow-800", label: `Expira en ${daysUntilExpiry} días` };
    } else {
        return { status: "valid", color: "bg-green-100 text-green-800", label: "Válido" };
    }
};

export function BatchManager() {
    const { data: batches, isLoading: batchesLoading } = useQuery<ProductBatch[]>({
        queryKey: ["product-batches"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/batches/`);
            return data;
        },
    });

    const { data: expiringBatches } = useQuery<{ count: number; batches: ExpiringBatch[] }>({
        queryKey: ["expiring-batches"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/batches/expiring/soon`);
            return data;
        },
    });

    const { data: inventorySummary } = useQuery<BatchInventorySummary>({
        queryKey: ["batch-inventory-summary"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/batches/inventory/summary`);
            return data;
        },
    });

    if (batchesLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Gestión de Lotes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Cargando lotes...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Lotes</h2>
                    <p className="text-muted-foreground">
                        Control de inventario por lotes con fechas de caducidad
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            {inventorySummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Lotes Activos</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inventorySummary.total_active_batches}</div>
                            <p className="text-xs text-muted-foreground">
                                {inventorySummary.products_with_batches} productos
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Próximos a Expirar</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {inventorySummary.expiring_within_30_days}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                En los próximos 30 días
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valor del Inventario</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${inventorySummary.total_inventory_value.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Por costo de lotes
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Distribución</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {inventorySummary.batch_distribution.length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Productos con lotes
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Expiring Batches Alert */}
            {expiringBatches && expiringBatches.count > 0 && (
                <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                        <div className="text-yellow-800">
                            <strong>{expiringBatches.count} lotes próximos a expirar</strong>
                            <div className="mt-2 space-y-1">
                                {expiringBatches.batches.slice(0, 3).map((batch) => (
                                    <div key={batch.id} className="text-sm">
                                        • {batch.product_name} - Lote {batch.batch_number} ({batch.days_until_expiry} días)
                                    </div>
                                ))}
                                {expiringBatches.count > 3 && (
                                    <div className="text-sm">• ... y {expiringBatches.count - 3} más</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Batches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lotes de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    {!batches || batches.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay lotes registrados</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Los lotes se crearán automáticamente al recibir compras
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>Fecha Caducidad</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Costo Unitario</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Fecha Recepción</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch) => {
                                    const expirationStatus = getExpirationStatus(batch.expiration_date);
                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                {batch.product.name}
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                {batch.batch_number}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(batch.expiration_date).toLocaleDateString('es-ES')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={expirationStatus.color}>
                                                    {expirationStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div>{batch.quantity_remaining} / {batch.quantity_received}</div>
                                                    <div className="text-muted-foreground text-xs">
                                                        Restante / Recibido
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {batch.unit_cost ? `$${batch.unit_cost.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {batch.supplier?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(batch.received_date).toLocaleDateString('es-ES')}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}