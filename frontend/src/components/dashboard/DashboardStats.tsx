import { IconTrendingDown, IconTrendingUp, IconCurrencyDollar, IconShoppingCart, IconWallet } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BASE_API_URL } from "@/config";
import { DashboardComparison } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsProps {
    timeframe: "7d" | "30d";
}

export function DashboardStats({ timeframe }: DashboardStatsProps) {
    const { data: comparison, isLoading } = useQuery<DashboardComparison>({
        queryKey: ["dashboard-comparison", timeframe],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/dashboard-comparison?timeframe=${timeframe}`);
            return data;
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    const stats = [
        {
            title: "Ventas Totales",
            value: comparison?.current.sales || 0,
            variation: comparison?.variations.sales || 0,
            icon: <IconShoppingCart className="size-4" />,
            description: "Ingresos brutos del periodo",
            isCurrency: true
        },
        {
            title: "Gastos",
            value: comparison?.current.expenses || 0,
            variation: comparison?.variations.expenses || 0,
            icon: <IconWallet className="size-4" />,
            description: "Costos y egresos registrados",
            isCurrency: true,
            inverse: true // Up is bad for expenses
        },
        {
            title: "Utilidad Neta",
            value: comparison?.current.profit || 0,
            variation: comparison?.variations.profit || 0,
            icon: <IconCurrencyDollar className="size-4" />,
            description: "Ingreso neto después de gastos",
            isCurrency: true
        }
    ];

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat, idx) => {
                const isNeutral = stat.variation === 0;
                const isBetter = stat.inverse ? stat.variation < 0 : stat.variation > 0;
                const isWorse = stat.inverse ? stat.variation > 0 : stat.variation < 0;

                const trendIcon = isBetter ? (
                    <IconTrendingUp className="size-4" />
                ) : isWorse ? (
                    <IconTrendingDown className="size-4" />
                ) : null;

                return (
                    <Card key={idx} className="@container/card">
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                {stat.icon}
                                {stat.title}
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl">
                                {stat.isCurrency ? formatCurrency(stat.value) : stat.value}
                            </CardTitle>
                            <CardAction>
                                <Badge
                                    variant={isNeutral ? "outline" : isBetter ? "default" : "destructive"}
                                    className="flex gap-1"
                                >
                                    {stat.variation > 0 ? "+" : ""}{stat.variation}%
                                    {trendIcon}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground">
                                {stat.description} vs periodo ant.
                            </p>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    )
}
