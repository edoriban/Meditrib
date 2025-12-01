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

export function ExpensesList() {
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
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Control de Gastos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Cargando gastos...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary Cards - Same style as SectionCards */}
            {summary && (
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-3">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {categories?.map((category) => (
                            <div
                                key={category.id}
                                className="p-3 border rounded-lg"
                                style={{ borderColor: category.color || '#e5e7eb' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className={getCategoryColor(category.type)}>
                                        {category.type === 'fixed' ? 'Fijo' : 'Variable'}
                                    </Badge>
                                </div>
                                <h4 className="font-medium text-sm mt-1">{category.name}</h4>
                                {summary?.categories[category.name] && (
                                    <p className="text-xs text-muted-foreground">
                                        ${summary.categories[category.name].total.toFixed(2)}
                                    </p>
                                )}
                            </div>
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
}