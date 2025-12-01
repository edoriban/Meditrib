import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FinancialSummary, IncomeStatement, ProductProfitability, MonthlyTrend } from "@/types/financial-reports";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Calendar } from "lucide-react";
import { BASE_API_URL } from "@/config";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
};

export function FinancialReports() {
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Reportes Financieros
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Cargando reportes financieros...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Financial Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.summary.total_revenue)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.changes.sales_percentage >= 0 ? '+' : ''}{formatPercentage(summary.changes.sales_percentage)} vs mes anterior
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
                            <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(summary.summary.total_expenses)}</div>
                            <p className="text-xs text-muted-foreground">
                                {summary.changes.expenses_percentage >= 0 ? '+' : ''}{formatPercentage(summary.changes.expenses_percentage)} vs mes anterior
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.summary.net_profit)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Margen: {formatPercentage(summary.summary.profit_margin)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance IVA</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${summary.summary.iva_balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(summary.summary.iva_balance)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {summary.summary.iva_balance >= 0 ? 'A favor' : 'A cargo'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monthly Trend Chart */}
            {monthlyTrend && monthlyTrend.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Tendencia Mensual - Últimos 6 Meses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [
                                            formatCurrency(value),
                                            name === 'sales' ? 'Ventas' : name === 'expenses' ? 'Gastos' : 'Utilidad'
                                        ]}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#22c55e" name="Ventas" />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Gastos" />
                                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Utilidad" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Income Statement Detail */}
            {summary && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de Resultados - Mes Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-green-600 mb-2">INGRESOS</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Ventas con IVA:</span>
                                            <span className="font-medium">{formatCurrency(summary.current_month.income.sales_with_iva)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Ventas sin IVA:</span>
                                            <span className="font-medium">{formatCurrency(summary.current_month.income.sales_without_iva)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold">Total Ingresos:</span>
                                            <span className="font-semibold">{formatCurrency(summary.current_month.income.total_sales)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-red-600 mb-2">GASTOS</h4>
                                    <div className="space-y-2">
                                        {Object.entries(summary.current_month.expenses.by_category).map(([category, data]) => (
                                            <div key={category} className="flex justify-between">
                                                <span>{category}:</span>
                                                <span className="font-medium">{formatCurrency(data.total)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between border-t pt-2">
                                            <span className="font-semibold">Total Gastos:</span>
                                            <span className="font-semibold">{formatCurrency(summary.current_month.expenses.total_expenses)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">UTILIDAD NETA:</span>
                                    <span className={`text-lg font-bold ${summary.current_month.profit.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(summary.current_month.profit.net_profit)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                                    <span>Margen de Utilidad:</span>
                                    <span>{formatPercentage(summary.current_month.profit.net_margin_percentage)}</span>
                                </div>
                            </div>
                        </div>
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
}