import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTrendingUp, IconTrendingDown, IconChartBar, IconFileSpreadsheet, IconReportAnalytics, IconDownload, IconCalendar, IconCash, IconReceipt } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";
import { toast } from "sonner";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FinancialSummary {
    current_month: {
        total_sales: number;
        total_cost: number;
        gross_profit: number;
        total_expenses: number;
        net_profit: number;
        margin_percentage: number;
    };
    last_month: {
        total_sales: number;
        total_cost: number;
        gross_profit: number;
        total_expenses: number;
        net_profit: number;
        margin_percentage: number;
    };
    comparison: {
        sales_change: number;
        profit_change: number;
        expenses_change: number;
    };
}

interface MonthlyTrend {
    month: string;
    sales: number;
    costs: number;
    expenses: number;
    profit: number;
}

interface ProductProfitability {
    medicine_id: number;
    medicine_name: string;
    total_quantity: number;
    total_sales: number;
    estimated_cost: number;
    profit: number;
    margin_percentage: number;
    average_price: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const formatPercentage = (value: number | undefined) => {
    if (value === undefined) return '+0.0%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};

export default function ReportsPage() {
    const [trendMonths, setTrendMonths] = useState("6");

    const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
        queryKey: ["financial-summary"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/financial-summary`);
            return data;
        },
    });

    const { data: monthlyTrend } = useQuery<MonthlyTrend[]>({
        queryKey: ["monthly-trend", trendMonths],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/monthly-trend?months=${trendMonths}`);
            return data;
        },
    });

    const { data: profitability } = useQuery<ProductProfitability[]>({
        queryKey: ["product-profitability"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/product-profitability`);
            return data;
        },
    });

    const handleExportExcel = () => {
        toast.info("Exportación a Excel próximamente disponible");
    };

    const handleExportPDF = () => {
        toast.info("Exportación a PDF próximamente disponible");
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Reportes Financieros</h1>
                        <p className="text-muted-foreground mt-2">
                            Análisis de ventas, gastos y rentabilidad del negocio.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportExcel}>
                            <IconFileSpreadsheet className="mr-1 h-4 w-4" />
                            Exportar Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF}>
                            <IconDownload className="mr-1 h-4 w-4" />
                            Exportar PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Ventas del Mes</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {summaryLoading ? "..." : formatCurrency(summary?.current_month?.total_sales || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className={(summary?.comparison?.sales_change ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                {(summary?.comparison?.sales_change ?? 0) >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                {formatPercentage(summary?.comparison?.sales_change)}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Ingresos por ventas <IconChartBar className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            vs mes anterior: {formatCurrency(summary?.last_month?.total_sales || 0)}
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Utilidad Neta</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${(summary?.current_month?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {summaryLoading ? "..." : formatCurrency(summary?.current_month?.net_profit || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className={(summary?.comparison?.profit_change ?? 0) >= 0 ? "text-green-600" : "text-red-600"}>
                                {(summary?.comparison?.profit_change ?? 0) >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                                {formatPercentage(summary?.comparison?.profit_change)}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Ganancia neta del mes <IconCash className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Margen: {(summary?.current_month?.margin_percentage ?? 0).toFixed(1)}%
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Gastos del Mes</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                            {summaryLoading ? "..." : formatCurrency(summary?.current_month?.total_expenses || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className={(summary?.comparison?.expenses_change ?? 0) <= 0 ? "text-green-600" : "text-red-600"}>
                                {(summary?.comparison?.expenses_change ?? 0) <= 0 ? <IconTrendingDown className="size-4" /> : <IconTrendingUp className="size-4" />}
                                {formatPercentage(summary?.comparison?.expenses_change)}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Egresos operativos <IconReceipt className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            vs mes anterior: {formatCurrency(summary?.last_month?.total_expenses || 0)}
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Utilidad Bruta</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {summaryLoading ? "..." : formatCurrency(summary?.current_month?.gross_profit || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconReportAnalytics className="size-4" />
                                Bruto
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Ventas - Costo <IconReportAnalytics className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Costo: {formatCurrency(summary?.current_month?.total_cost || 0)}
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Monthly Trend Chart */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Tendencia Mensual</CardTitle>
                            <CardDescription>Comparativa de ventas, costos y gastos</CardDescription>
                        </div>
                        <Select value={trendMonths} onValueChange={setTrendMonths}>
                            <SelectTrigger className="w-32">
                                <IconCalendar className="mr-2 h-4 w-4" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 meses</SelectItem>
                                <SelectItem value="6">6 meses</SelectItem>
                                <SelectItem value="12">12 meses</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    {monthlyTrend && monthlyTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                <Tooltip 
                                    formatter={(value: number) => formatCurrency(value)}
                                    labelStyle={{ color: '#000' }}
                                />
                                <Legend />
                                <Bar dataKey="sales" name="Ventas" fill="#22c55e" />
                                <Bar dataKey="costs" name="Costos" fill="#f59e0b" />
                                <Bar dataKey="expenses" name="Gastos" fill="#ef4444" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-muted-foreground">
                            No hay datos para mostrar
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Product Profitability */}
            <Card>
                <CardHeader>
                    <CardTitle>Rentabilidad por Producto</CardTitle>
                    <CardDescription>Productos más rentables del período</CardDescription>
                </CardHeader>
                <CardContent>
                    {profitability && profitability.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead className="text-right">Unidades</TableHead>
                                    <TableHead className="text-right">Ingresos</TableHead>
                                    <TableHead className="text-right">Costo</TableHead>
                                    <TableHead className="text-right">Utilidad</TableHead>
                                    <TableHead className="text-right">Margen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profitability.slice(0, 10).map((product) => (
                                    <TableRow key={product.medicine_id}>
                                        <TableCell className="font-medium">{product.medicine_name}</TableCell>
                                        <TableCell className="text-right">{product.total_quantity || 0}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(product.total_sales || 0)}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">{formatCurrency(product.estimated_cost || 0)}</TableCell>
                                        <TableCell className={`text-right font-semibold ${(product.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(product.profit || 0)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={(product.margin_percentage || 0) >= 20 ? 'text-green-600' : (product.margin_percentage || 0) >= 10 ? 'text-amber-600' : 'text-red-600'}>
                                                {(product.margin_percentage || 0).toFixed(1)}%
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                            No hay datos de productos para mostrar
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}