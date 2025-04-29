import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useQuery } from "@tanstack/react-query";
import { Medicine } from "../inventory/MedicineTable";
import axios from "axios";
import { DollarSign, Package, AlertCircle, TrendingUp } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function ReportCards() {
    const { data: medicines, isLoading } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            try {
                const { data } = await axios.get("/api/v1/medicines/");
                return data;
            } catch (error) {
                console.error("Error fetching medicines:", error);
                throw error;
            }
        }
    });

    // Calcular estadísticas
    const totalProducts = medicines?.length || 0;
    const totalValue = medicines?.reduce((sum, med) => sum + (med.sale_price * (med.inventory?.quantity || 0)), 0) || 0;
    const lowStock = medicines?.filter(med => (med.inventory?.quantity || 0) < 10).length || 0;
    const mostExpensive = medicines?.sort((a, b) => b.sale_price - a.sale_price)[0]?.name || "N/A";

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                        Productos en Catálogo
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ? <Skeleton className="h-8 w-16" /> : totalProducts}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Medicamentos registrados
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                        Valor del Inventario
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ?
                            <Skeleton className="h-8 w-24" /> :
                            `$${totalValue.toFixed(2)}`
                        }
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Valor total en almacén
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                        Stock Bajo
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {isLoading ? <Skeleton className="h-8 w-16" /> : lowStock}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Productos con menos de 10 unidades
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                        Producto más costoso
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl font-bold truncate">
                        {isLoading ? <Skeleton className="h-8 w-32" /> : mostExpensive}
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                        Medicamento de mayor precio
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}