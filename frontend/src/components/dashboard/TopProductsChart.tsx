import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BASE_API_URL } from "@/config";
import { TopProduct } from "@/types/dashboard";

export function TopProductsChart() {
    const { data: products = [], isLoading } = useQuery<TopProduct[]>({
        queryKey: ["top-selling-products"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/top-selling?limit=10`);
            return data;
        }
    });

    const chartColors = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
    ];

    if (isLoading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Top 10 Productos</CardTitle>
                    <CardDescription>Cargando datos de ventas...</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center gap-4 w-full px-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-4 bg-muted rounded w-full" style={{ width: `${100 - (i * 15)}%` }} />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full w-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold tracking-tight">Top Productos</CardTitle>
                <CardDescription>
                    Productos con mayor volumen de venta
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
                <div className="h-full min-h-[350px] w-full pt-4">
                    {products.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={products}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload as TopProduct;
                                            return (
                                                <div className="bg-popover border text-popover-foreground p-3 rounded-lg shadow-lg text-xs">
                                                    <p className="font-bold mb-1">{data.name}</p>
                                                    <p>Vendidos: <span className="font-medium">{data.total_sold} unid</span></p>
                                                    <p>Ingresos: <span className="font-medium">{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(data.total_revenue)}</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="total_sold"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    {products.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground italic text-sm">
                            Sin datos de ventas registrados
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
