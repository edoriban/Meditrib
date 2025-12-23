import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ProductBatch, ExpiringBatch, BatchInventorySummary } from "@/types/batches";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconBox, IconAlertTriangle, IconCalendar, IconTrendingUp, IconTrendingDown, IconClock, IconPackage } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const getExpirationStatus = (expirationDate: string) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
        return { status: "expired", color: "bg-red-100 text-red-800 border-red-200", label: "Expirado" };
    } else if (daysUntilExpiry <= 30) {
        return { status: "expiring", color: "bg-amber-100 text-amber-800 border-amber-200", label: `${daysUntilExpiry} días` };
    } else if (daysUntilExpiry <= 90) {
        return { status: "warning", color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: `${daysUntilExpiry} días` };
    } else {
        return { status: "valid", color: "bg-green-100 text-green-800 border-green-200", label: "Válido" };
    }
};

export default function BatchesPage() {
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

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestión de Lotes</h1>
                        <p className="text-muted-foreground mt-2">
                            Control de inventario por lotes con fechas de caducidad.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <IconCalendar className="mr-1 h-4 w-4" />
                            Ver Calendario
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {inventorySummary && (
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Lotes Activos</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {inventorySummary.total_active_batches}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconPackage className="size-4" />
                                    Activos
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                {inventorySummary.products_with_batches} medicamentos <IconTrendingUp className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Con lotes registrados
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Próximos a Expirar</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-600">
                                {inventorySummary.expiring_within_30_days}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline" className="text-amber-600">
                                    <IconAlertTriangle className="size-4" />
                                    Atención
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                En los próximos 30 días <IconClock className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Requieren acción
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Valor del Inventario</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatCurrency(inventorySummary.total_inventory_value)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp className="size-4" />
                                    Costo
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Por costo de lotes <IconTrendingUp className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Inversión actual
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Distribución</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {inventorySummary.batch_distribution?.length || 0}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconBox className="size-4" />
                                    Tipos
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Medicamentos con lotes <IconTrendingDown className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Clasificados por producto
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Expiring Batches Alert */}
            {expiringBatches && expiringBatches.count > 0 && (
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
                                <IconAlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                                    {expiringBatches.count} lotes próximos a expirar
                                </h3>
                                <div className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                                    {expiringBatches.batches.slice(0, 5).map((batch) => (
                                        <div key={batch.id}>
                                            • {batch.product_name} - Lote {batch.batch_number} ({batch.days_until_expiry} días)
                                        </div>
                                    ))}
                                    {expiringBatches.count > 5 && (
                                        <div className="font-medium">• ... y {expiringBatches.count - 5} más</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Batches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lotes de Medicamentos</CardTitle>
                    <CardDescription>Lista completa de lotes registrados en el sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    {batchesLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando lotes...</div>
                    ) : !batches || batches.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                                <IconBox className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold mb-2">No hay lotes registrados</h3>
                            <p className="text-sm text-muted-foreground">
                                Los lotes se crearán automáticamente al recibir compras de proveedores.
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Medicamento</TableHead>
                                    <TableHead>Número de Lote</TableHead>
                                    <TableHead>Fecha Caducidad</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead>Costo Unitario</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch) => {
                                    const expirationStatus = getExpirationStatus(batch.expiration_date);
                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">
                                                {batch.product?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {batch.batch_number}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(batch.expiration_date).toLocaleDateString('es-ES')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={expirationStatus.color}>
                                                    {expirationStatus.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <span className="font-medium">{batch.quantity_remaining}</span>
                                                    <span className="text-muted-foreground"> / {batch.quantity_received}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {batch.unit_cost ? formatCurrency(batch.unit_cost) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {batch.supplier?.name || '-'}
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
