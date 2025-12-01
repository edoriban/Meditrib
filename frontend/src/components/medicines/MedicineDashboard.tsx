import React from 'react';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBoxSeam, IconCoinOff, IconCoin, IconAlertTriangle, IconChartLine, IconReceipt, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface Medicine {
    inventory?: {
        quantity?: number | null;
    } | null;
    purchase_price?: number | null;
    sale_price: number;
}

interface MedicineDashboardProps {
    medicines: Medicine[] | undefined | null;
    isLoading?: boolean;
    error?: unknown;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const MedicineDashboard: React.FC<MedicineDashboardProps> = ({ medicines }) => {
    const totalInventoryValue = medicines?.reduce((total, med) => {
        const quantity = med.inventory?.quantity ?? 0;
        const purchasePrice = med.purchase_price ?? 0;
        return total + quantity * purchasePrice;
    }, 0) ?? 0;

    const outOfStockCount = medicines?.filter(med => (med.inventory?.quantity ?? 0) === 0).length ?? 0;

    const potentialProfit = medicines?.reduce((total, med) => {
        const quantity = med.inventory?.quantity ?? 0;
        const purchasePrice = med.purchase_price ?? 0;
        const salePrice = med.sale_price ?? 0;
        const profitPerItem = salePrice - purchasePrice;
        return total + (quantity > 0 && profitPerItem > 0 ? quantity * profitPerItem : 0);
    }, 0) ?? 0;

    const totalMedicines = medicines?.length ?? 0;
    
    const lowStockCount = medicines?.filter(med => {
        const quantity = med.inventory?.quantity ?? 0;
        return quantity > 0 && quantity <= 10;
    }).length ?? 0;

    const highProfitCount = medicines?.filter(med => {
        const purchasePrice = med.purchase_price ?? 0;
        if (purchasePrice === 0) return false;
        const margin = (med.sale_price - purchasePrice) / purchasePrice * 100;
        return margin > 30;
    }).length ?? 0;

    const totalSaleValue = medicines?.reduce((total, med) => {
        const quantity = med.inventory?.quantity ?? 0;
        return total + quantity * med.sale_price;
    }, 0) ?? 0;

    const roiPercentage = totalInventoryValue > 0 ? ((potentialProfit / totalInventoryValue) * 100).toFixed(1) : "0";
    const outOfStockPercentage = totalMedicines > 0 ? ((outOfStockCount / totalMedicines) * 100).toFixed(1) : "0";
    const highProfitPercentage = totalMedicines > 0 ? ((highProfitCount / totalMedicines) * 100).toFixed(1) : "0";

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
            {/* Stock Crítico */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Stock Crítico</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {lowStockCount}
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
                        Requieren reabastecimiento <IconTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Menos de 10 unidades
                    </div>
                </CardFooter>
            </Card>

            {/* Sin Stock */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Sin Stock</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                        {outOfStockCount}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-red-600">
                            <IconCoinOff className="size-4" />
                            {outOfStockPercentage}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Agotados del catálogo <IconTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        De {totalMedicines} medicamentos
                    </div>
                </CardFooter>
            </Card>

            {/* Alta Rentabilidad */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Alta Rentabilidad</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-600">
                        {highProfitCount}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-purple-600">
                            <IconChartLine className="size-4" />
                            {highProfitPercentage}%
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Margen superior al 30% <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Del catálogo total
                    </div>
                </CardFooter>
            </Card>

            {/* Valor del Inventario */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Valor del Inventario</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                        {formatCurrency(totalInventoryValue)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline">
                            <IconBoxSeam className="size-4" />
                            Costo
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Inversión actual <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Basado en precios de compra
                    </div>
                </CardFooter>
            </Card>

            {/* Valor de Venta */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Valor de Venta</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-indigo-600">
                        {formatCurrency(totalSaleValue)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-indigo-600">
                            <IconReceipt className="size-4" />
                            PVP
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Inventario a precio venta <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Valor de mercado
                    </div>
                </CardFooter>
            </Card>

            {/* Ganancia Potencial */}
            <Card className="@container/card">
                <CardHeader>
                    <CardDescription>Ganancia Potencial</CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                        {formatCurrency(potentialProfit)}
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="text-green-600">
                            <IconCoin className="size-4" />
                            ~{roiPercentage}% ROI
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Si se vende todo <IconTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Utilidad bruta esperada
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default MedicineDashboard;