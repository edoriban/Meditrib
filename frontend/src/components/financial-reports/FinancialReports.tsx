import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FinancialSummary, ProductProfitability, MonthlyTrend } from "@/types/financial-reports";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { DollarSign, PieChart } from "lucide-react";
import { BASE_API_URL } from "@/config";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
};

interface FinancialReportsProps {
    hideSummary?: boolean;
}

export const FinancialReports = React.memo(function FinancialReports({ hideSummary = false }: FinancialReportsProps) {
    const { data: summary, isLoading: summaryLoading } = useQuery<FinancialSummary>({
        queryKey: ["financial-summary"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/financial-summary`);
            return data;
        },
    });

    const { data: monthlyTrend } = useQuery<MonthlyTrend[]>({
        queryKey: ["monthly-trend"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/monthly-trend`);
            return data;
        },
    });

    const { data: productProfitability } = useQuery<ProductProfitability[]>({
        queryKey: ["product-profitability"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/financial-reports/product-profitability`);
            return data;
        },
    });

    if (summaryLoading) {
        return (
            <div className="space-y-6">
                {/* Summary Cards Skeleton */}
                {!hideSummary && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="p-4">
                                <div className="space-y-3">
                                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                                    <div className="h-8 w-36 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Chart Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted rounded animate-pulse" />
                    </CardContent>
                </Card>
                {/* Income Statement Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="h-6 w-56 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="h-40 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Financial Summary Cards - Same style as SectionCards */}
            {summary && !hideSummary && (
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Ingresos Totales</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatCurrency(summary.summary.total_revenue)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    {summary.changes.sales_percentage >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                                    {summary.changes.sales_percentage >= 0 ? '+' : ''}{formatPercentage(summary.changes.sales_percentage)}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                vs mes anterior {summary.changes.sales_percentage >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Ventas del mes actual
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Gastos Totales</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {formatCurrency(summary.summary.total_expenses)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    {summary.changes.expenses_percentage <= 0 ? <IconTrendingDown /> : <IconTrendingUp />}
                                    {summary.changes.expenses_percentage >= 0 ? '+' : ''}{formatPercentage(summary.changes.expenses_percentage)}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                vs mes anterior {summary.changes.expenses_percentage <= 0 ? <IconTrendingDown className="size-4" /> : <IconTrendingUp className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Gastos operativos
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Utilidad Neta</CardDescription>
                            <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${summary.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.summary.net_profit)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    {summary.summary.net_profit >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                                    {formatPercentage(summary.summary.profit_margin)}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Margen de utilidad {summary.summary.net_profit >= 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Ingresos - Gastos
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Balance IVA</CardDescription>
                            <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${summary.summary.iva_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.summary.iva_balance)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <PieChart className="size-4" />
                                    {summary.summary.iva_balance >= 0 ? 'A favor' : 'A cargo'}
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                IVA {summary.summary.iva_balance >= 0 ? 'recuperable' : 'por pagar'} <PieChart className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Cobrado vs Pagado
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Monthly Trend Chart */}
            {monthlyTrend && monthlyTrend.length > 0 && (
                <Card className="@container/card">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Tendencia Mensual</CardTitle>
                        <CardDescription>Comparativa de ventas, gastos y utilidad de los últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        className="text-xs"
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => formatCurrency(value).replace('MX$', '$')}
                                        className="text-xs"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                        formatter={(value: number, name: string) => [
                                            formatCurrency(value),
                                            name === 'sales' ? 'Ventas' : name === 'expenses' ? 'Gastos' : 'Utilidad'
                                        ]}
                                    />
                                    <Legend
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                    <Line type="monotone" dataKey="sales" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Ventas" />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} name="Gastos" />
                                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Utilidad" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Income Statement Detail */}
            {summary && (
                <Card className="@container/card">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Estado de Resultados - Mes Actual</CardTitle>
                        <CardDescription>Resumen de ingresos y gastos del período</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Ingresos */}
                            <Card className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-green-100 text-green-700 rounded-full">
                                        <IconTrendingUp className="size-4" />
                                    </div>
                                    <h4 className="font-semibold text-green-700 dark:text-green-400">INGRESOS</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Ventas con IVA:</span>
                                        <span className="font-medium tabular-nums">{formatCurrency(summary.current_month.income.sales_with_iva)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Ventas sin IVA:</span>
                                        <span className="font-medium tabular-nums">{formatCurrency(summary.current_month.income.sales_without_iva)}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                                        <span className="font-semibold">Total Ingresos:</span>
                                        <span className="font-bold text-green-600 tabular-nums">{formatCurrency(summary.current_month.income.total_sales)}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Gastos */}
                            <Card className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-red-100 text-red-700 rounded-full">
                                        <IconTrendingDown className="size-4" />
                                    </div>
                                    <h4 className="font-semibold text-red-700 dark:text-red-400">GASTOS</h4>
                                </div>
                                <div className="space-y-2 text-sm">
                                    {Object.entries(summary.current_month.expenses.by_category).length > 0 ? (
                                        Object.entries(summary.current_month.expenses.by_category).map(([category, data]) => (
                                            <div key={category} className="flex justify-between items-center">
                                                <span className="text-muted-foreground">{category}:</span>
                                                <span className="font-medium tabular-nums">{formatCurrency(data.total)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground text-center py-2">Sin gastos registrados</div>
                                    )}
                                    <div className="flex justify-between items-center border-t pt-2 mt-2">
                                        <span className="font-semibold">Total Gastos:</span>
                                        <span className="font-bold text-red-600 tabular-nums">{formatCurrency(summary.current_month.expenses.total_expenses)}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Utilidad Neta */}
                        <Card className="mt-4 p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${summary.current_month.profit.net_profit >= 0
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-orange-100 text-orange-700'}`}>
                                        <DollarSign className="size-4" />
                                    </div>
                                    <span className="text-lg font-semibold">UTILIDAD NETA</span>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-bold tabular-nums ${summary.current_month.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(summary.current_month.profit.net_profit)}
                                    </span>
                                    <div className="text-sm text-muted-foreground">
                                        Margen: {formatPercentage(summary.current_month.profit.net_margin_percentage)}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </CardContent>
                </Card>
            )}

            {/* Product Profitability */}
            {productProfitability && productProfitability.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rentabilidad por Producto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad Vendida</TableHead>
                                    <TableHead>Ingresos</TableHead>
                                    <TableHead>Costo Estimado</TableHead>
                                    <TableHead>Utilidad</TableHead>
                                    <TableHead>Margen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productProfitability.slice(0, 10).map((product) => (
                                    <TableRow key={product.medicine_id}>
                                        <TableCell className="font-medium">{product.medicine_name}</TableCell>
                                        <TableCell>{product.total_quantity}</TableCell>
                                        <TableCell>{formatCurrency(product.total_sales)}</TableCell>
                                        <TableCell>{formatCurrency(product.estimated_cost)}</TableCell>
                                        <TableCell className={product.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatCurrency(product.profit)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={product.margin_percentage >= 20 ? "default" : product.margin_percentage >= 10 ? "secondary" : "destructive"}>
                                                {formatPercentage(product.margin_percentage)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});