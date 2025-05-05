import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBoxSeam, IconCoinOff, IconCoin, IconAlertTriangle, IconChartLine, IconReceipt, IconChartPie } from "@tabler/icons-react";

interface Medicine {
    inventory?: {
        quantity?: number | null;
    } | null;
    purchase_price?: number | null;
    sale_price: number;
}

interface MedicineDashboardProps {
    medicines: Medicine[] | undefined | null;
    isLoading: boolean;
    error: any;
}

const MedicineDashboard: React.FC<MedicineDashboardProps> = ({ medicines, isLoading, error }) => {
    const totalInventoryValue = medicines?.reduce((total, med) => {
        const quantity = med.inventory?.quantity ?? 0;
        const purchasePrice = med.purchase_price ?? 0;
        return total + quantity * purchasePrice;
    }, 0) ?? 0;

    const outOfStockCount = medicines?.filter(med => (med.inventory?.quantity ?? 0) === 0).length ?? 0;

    const potentialProfit = medicines?.reduce((total, med) => {
        const quantity = med.inventory?.quantity ?? 0;
        const purchasePrice = med.purchase_price ?? 0;
        const salePrice = med.sale_price ?? 0; // Use default 0 if sale_price is missing/nullish
        const profitPerItem = salePrice - purchasePrice;
        // Only add profit if it's positive and quantity > 0
        return total + (quantity > 0 && profitPerItem > 0 ? quantity * profitPerItem : 0);
    }, 0) ?? 0;

    const totalMedicines = medicines?.length ?? 0;

    return (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-6">
            {/* Tarjeta 4: Medicamentos con Stock Bajo */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Stock Crítico</h3>
                        <div className="p-2 bg-amber-100 text-amber-700 rounded-full">
                            <IconAlertTriangle className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">
                            {medicines?.filter(med => {
                                const quantity = med.inventory?.quantity ?? 0;
                                return quantity > 0 && quantity <= 10;
                            }).length}
                        </div>
                        <div className="text-sm ml-2">medicamentos</div>
                    </div>
                    <div className="flex items-center pt-4">
                        <div className="text-xs text-muted-foreground">
                            Requieren reabastecimiento pronto
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Tarjeta 2: Medicamentos sin stock */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Medicamentos sin stock</h3>
                        <div className="p-2 bg-red-100 text-red-700 rounded-full">
                            <IconCoinOff className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">{outOfStockCount}</div>
                        <div className="text-sm ml-2">
                            <span className="text-red-600 font-medium">
                                {((outOfStockCount / totalMedicines) * 100).toFixed(1)}%
                            </span> del total
                        </div>
                    </div>
                    <div className="flex items-center pt-4">
                        <div className="text-xs text-muted-foreground pt-1">
                            De {totalMedicines} medicamentos
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Tarjeta 5: Medicamentos de Alta Rentabilidad */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Alta Rentabilidad</h3>
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-full">
                            <IconChartLine className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">
                            {medicines?.filter(med => {
                                const purchasePrice = med.purchase_price ?? 0;
                                if (purchasePrice === 0) return false;
                                const margin = (med.sale_price - purchasePrice) / purchasePrice * 100;
                                return margin > 30; // Más de 30% de margen
                            }).length}
                        </div>
                        <div className="text-sm ml-2">
                            <span className="text-purple-600 font-medium">
                                {medicines?.length ?
                                    ((medicines.filter(med => {
                                        const purchasePrice = med.purchase_price ?? 0;
                                        if (purchasePrice === 0) return false;
                                        const margin = (med.sale_price - purchasePrice) / purchasePrice * 100;
                                        return margin > 30;
                                    }).length / medicines.length) * 100).toFixed(1) : 0}%
                            </span> del catálogo
                        </div>
                    </div>
                    <div className="flex items-center pt-4">
                        <div className="text-xs text-muted-foreground">
                            Con margen superior al 30%
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Tarjeta 1: Valor total del inventario */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Valor del inventario</h3>
                        <div className="p-2 bg-green-100 text-green-700 rounded-full">
                            <IconBoxSeam className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground ml-2">costo total</p>
                    </div>
                    <div className="flex items-center pt-4">
                        <div className="text-xs text-muted-foreground">
                            Basado en precios de compra
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Valor de venta total</h3>
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full">
                            <IconReceipt className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">
                            ${medicines?.reduce((total, med) => {
                                const quantity = med.inventory?.quantity ?? 0;
                                return total + quantity * med.sale_price;
                            }, 0).toFixed(2) ?? "0.00"}
                        </div>
                    </div>
                    <div className="flex items-center pt-4">
                        <div className="text-xs text-muted-foreground">
                            Valor del inventario a precio de venta
                        </div>
                    </div>
                </CardContent>
            </Card>


            {/* Tarjeta 3: Ganancia potencial */}
            <Card className="overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Ganancia potencial</h3>
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-full">
                            <IconCoin className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline">
                        <div className="text-2xl font-bold">${potentialProfit.toFixed(2)}</div>
                        <div className="text-xs text-green-600 ml-2">
                            ~{((potentialProfit / totalInventoryValue) * 100).toFixed(1)}% ROI
                        </div>
                    </div>
                    <div className="flex items-baseline pt-4">
                        <div className="text-xs text-muted-foreground">
                            Si se vende todo el inventario
                        </div>
                    </div>
                </CardContent>
            </Card>



        </div>
    );
};

export default MedicineDashboard;