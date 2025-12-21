import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Expense, ExpenseCategory, ExpenseSummary } from "@/types/expense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, DollarSign } from "lucide-react";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";

const getCategoryColor = (type: string) => {
    return type === 'fixed' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300';
};

interface ExpensesListProps {
    hideSummary?: boolean;
}

export const ExpensesList = React.memo(function ExpensesList({ hideSummary = false }: ExpensesListProps) {
    const queryClient = useQueryClient();

    const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
        queryKey: ["expenses"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/expenses/`);
            return data;
        },
    });

    const { data: categories } = useQuery<ExpenseCategory[]>({
        queryKey: ["expense-categories"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/expenses/categories/`);
            return data;
        },
    });

    const { data: summary } = useQuery<ExpenseSummary>({
        queryKey: ["expense-summary"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/expenses/summary`);
            return data;
        },
    });

    const initializeCategoriesMutation = useMutation({
        mutationFn: () => axios.post(`${BASE_API_URL}/expenses/initialize-default-categories`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
        },
    });

    if (expensesLoading) {
        return (
            <div className="space-y-4">
                {/* Summary Skeletons */}
                {!hideSummary && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-4">
                                <div className="space-y-3">
                                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                                    <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                                    <div className="h-3 w-40 bg-muted rounded animate-pulse" />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
                {/* Categories Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {/* Table Skeleton */}
                <Card>
                    <CardHeader>
                        <div className="h-6 w-40 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards - Same style as SectionCards */}
            {summary && !hideSummary && (
                <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Total Gastos</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                ${summary.total_expenses.toFixed(2)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingDown />
                                    {summary.expense_count} registros
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Gastos del período <IconTrendingDown className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Total de egresos registrados
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>IVA Deducible</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                                ${summary.total_tax_amount.toFixed(2)}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    A favor
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Crédito fiscal disponible <IconTrendingUp className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                IVA recuperable
                            </div>
                        </CardFooter>
                    </Card>

                    <Card className="@container/card">
                        <CardHeader>
                            <CardDescription>Categorías</CardDescription>
                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                {Object.keys(summary.categories).length}
                            </CardTitle>
                            <CardAction>
                                <Badge variant="outline">
                                    <IconTrendingUp />
                                    Activas
                                </Badge>
                            </CardAction>
                        </CardHeader>
                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Tipos de gastos <IconTrendingUp className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Fijos y variables
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Categories Management */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Categorías de Gastos</CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => initializeCategoriesMutation.mutate()}
                            disabled={initializeCategoriesMutation.isPending}
                        >
                            {initializeCategoriesMutation.isPending ? "Inicializando..." : "Inicializar Categorías"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {categories?.map((category) => (
                            <Card
                                key={category.id}
                                className="p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant={category.type === 'fixed' ? 'default' : 'secondary'}>
                                        {category.type === 'fixed' ? 'Fijo' : 'Variable'}
                                    </Badge>
                                </div>
                                <h4 className="font-medium text-sm mt-2">{category.name}</h4>
                                {summary?.categories[category.name] && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        ${summary.categories[category.name].total.toFixed(2)}
                                    </p>
                                )}
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Registro de Gastos</CardTitle>
                        <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Gasto
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {!expenses || expenses.length === 0 ? (
                        <div className="text-center py-8">
                            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay gastos registrados</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Registra tus primeros gastos para controlar tus finanzas
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Categoría</TableHead>
                                    <TableHead>Proveedor</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>IVA</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            {new Date(expense.expense_date).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getCategoryColor(expense.category.type)}>
                                                {expense.category.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{expense.supplier || '-'}</TableCell>
                                        <TableCell className="font-mono">
                                            ${expense.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {expense.is_tax_deductible ? (
                                                <span className="text-green-600">${expense.tax_amount.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                Editar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
});