import { IconPackage, IconCash, IconAlertTriangle, IconClock } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BASE_API_URL } from "@/config";
import { FulfillmentStats } from "@/types/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function FulfillmentWidgets() {
    const { data: stats, isLoading } = useQuery<FulfillmentStats>({
        queryKey: ["fulfillment-stats"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/fulfillment-stats`);
            return data;
        },
        refetchInterval: 60000 // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
            </div>
        );
    }

    const gridItems = [
        {
            label: "Pendientes Entrega",
            value: stats?.pending_delivery || 0,
            icon: <IconPackage className="size-5 text-orange-500" />,
        },
        {
            label: "Pendientes Cobro",
            value: stats?.pending_payment || 0,
            icon: <IconCash className="size-5 text-green-500" />,
        },
        {
            label: "En Tránsito",
            value: stats?.shipped_but_not_delivered || 0,
            icon: <IconClock className="size-5 text-blue-500" />,
        },
        {
            label: "Vence pronto (30d)",
            value: stats?.expiring_soon || 0,
            icon: <IconAlertTriangle className="size-5 text-red-500" />,
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {gridItems.map((item, idx) => (
                <Card key={idx}>
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {item.label}
                        </CardTitle>
                        {item.icon}
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                        <div className="text-2xl font-bold">{item.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
