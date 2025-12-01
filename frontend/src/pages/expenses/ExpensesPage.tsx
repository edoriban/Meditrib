import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Expense, ExpenseCategory, ExpenseSummary } from "@/types/expense";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconReceipt, IconTrendingDown, IconPlus, IconEdit, IconTrash, IconReceiptTax, IconCurrencyDollar, IconCategory, IconSettings } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [activeTab, setActiveTab] = useState("expenses");
    
    // Category management state
    const [showCategoryDialog, setShowCategoryDialog] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
    const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null);
    const [categoryFormData, setCategoryFormData] = useState({
        name: '',
        description: '',
        type: 'variable' as 'fixed' | 'variable',
        color: '#6b7280'
    });

    const [formData, setFormData] = useState({
        description: '',
        amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        category_id: 0,
        payment_method: 'Efectivo',
        supplier: '',
        invoice_number: '',
        is_tax_deductible: false,
        notes: '',
        created_by: 1
    });

    const { data: expenses, isLoading } = useQuery<Expense[]>({
        queryKey: ["expenses"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/expenses/`);
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

    const { data: categories } = useQuery<ExpenseCategory[]>({
        queryKey: ["expense-categories"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/expenses/categories/`);
            return data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: typeof formData) => axios.post(`${BASE_API_URL}/expenses/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
            setShowCreateDialog(false);
            resetForm();
            toast.success("Gasto registrado");
        },
        onError: () => {
            toast.error("Error al registrar gasto");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: typeof formData }) => 
            axios.put(`${BASE_API_URL}/expenses/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
            setEditingExpense(null);
            resetForm();
            toast.success("Gasto actualizado");
        },
        onError: () => {
            toast.error("Error al actualizar gasto");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => axios.delete(`${BASE_API_URL}/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
            toast.success("Gasto eliminado");
        },
        onError: () => {
            toast.error("Error al eliminar gasto");
        },
    });

    const initCategoriesMutation = useMutation({
        mutationFn: () => axios.post(`${BASE_API_URL}/expenses/initialize-default-categories`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            toast.success("Categorías inicializadas");
        },
    });

    // Category CRUD mutations
    const createCategoryMutation = useMutation({
        mutationFn: (data: typeof categoryFormData) => axios.post(`${BASE_API_URL}/expenses/categories/`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            setShowCategoryDialog(false);
            resetCategoryForm();
            toast.success("Categoría creada");
        },
        onError: () => {
            toast.error("Error al crear categoría");
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: typeof categoryFormData }) => 
            axios.put(`${BASE_API_URL}/expenses/categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
            setEditingCategory(null);
            resetCategoryForm();
            toast.success("Categoría actualizada");
        },
        onError: () => {
            toast.error("Error al actualizar categoría");
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: number) => axios.delete(`${BASE_API_URL}/expenses/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expense-categories"] });
            queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
            setDeletingCategory(null);
            toast.success("Categoría eliminada");
        },
        onError: () => {
            toast.error("No se puede eliminar la categoría. Tiene gastos asociados.");
        },
    });

    const resetCategoryForm = () => {
        setCategoryFormData({
            name: '',
            description: '',
            type: 'variable',
            color: '#6b7280'
        });
    };

    const handleEditCategory = (category: ExpenseCategory) => {
        setCategoryFormData({
            name: category.name,
            description: category.description || '',
            type: category.type,
            color: category.color || '#6b7280'
        });
        setEditingCategory(category);
    };

    const handleSubmitCategory = () => {
        if (editingCategory) {
            updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryFormData });
        } else {
            createCategoryMutation.mutate(categoryFormData);
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: 0,
            expense_date: new Date().toISOString().split('T')[0],
            category_id: 0,
            payment_method: 'Efectivo',
            supplier: '',
            invoice_number: '',
            is_tax_deductible: false,
            notes: '',
            created_by: 1
        });
    };

    const handleEdit = (expense: Expense) => {
        setFormData({
            description: expense.description,
            amount: expense.amount,
            expense_date: expense.expense_date.split('T')[0],
            category_id: expense.category_id,
            payment_method: expense.payment_method || 'Efectivo',
            supplier: expense.supplier || '',
            invoice_number: expense.invoice_number || '',
            is_tax_deductible: expense.is_tax_deductible,
            notes: expense.notes || '',
            created_by: expense.created_by
        });
        setEditingExpense(expense);
    };

    const handleSubmit = () => {
        if (editingExpense) {
            updateMutation.mutate({ id: editingExpense.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Control de Gastos</h1>
                        <p className="text-muted-foreground mt-2">
                            Administra los gastos operativos del negocio.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(!categories || categories.length === 0) && (
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => initCategoriesMutation.mutate()}
                                disabled={initCategoriesMutation.isPending}
                            >
                                <IconCategory className="mr-1 h-4 w-4" />
                                Inicializar Categorías
                            </Button>
                        )}
                        {activeTab === "expenses" ? (
                            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                                <IconPlus className="mr-1 h-4 w-4" />
                                Nuevo Gasto
                            </Button>
                        ) : (
                            <Button size="sm" onClick={() => setShowCategoryDialog(true)}>
                                <IconPlus className="mr-1 h-4 w-4" />
                                Nueva Categoría
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="expenses">
                        <IconReceipt className="mr-1 h-4 w-4" />
                        Gastos
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                        <IconSettings className="mr-1 h-4 w-4" />
                        Categorías
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Gastos</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                            {formatCurrency(summary?.total_expenses || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-red-600">
                                <IconTrendingDown className="size-4" />
                                Egresos
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Este período <IconTrendingDown className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            {summary?.expense_count || 0} gastos registrados
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Deducibles de Impuestos</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-600">
                            {formatCurrency(summary?.total_tax_deductible || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-green-600">
                                <IconReceiptTax className="size-4" />
                                Deducible
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Gastos facturados <IconReceiptTax className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Con comprobante fiscal
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>IVA Acreditable</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {formatCurrency(summary?.total_tax_amount || 0)}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconCurrencyDollar className="size-4" />
                                IVA
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Impuesto acreditable <IconCurrencyDollar className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Para declaración fiscal
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Categorías</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {Object.keys(summary?.categories || {}).length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconCategory className="size-4" />
                                Tipos
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Clasificación de gastos <IconCategory className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Fijos y variables
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Categories Summary */}
            {summary?.categories && Object.keys(summary.categories).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Gastos por Categoría</CardTitle>
                        <CardDescription>Distribución de gastos por tipo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(summary.categories).map(([name, data]) => (
                                <div 
                                    key={name} 
                                    className="p-4 rounded-lg border"
                                    style={{ borderLeftWidth: '4px', borderLeftColor: data.color || '#6b7280' }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium">{name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {data.type === 'fixed' ? 'Fijo' : 'Variable'}
                                        </Badge>
                                    </div>
                                    <p className="text-xl font-semibold">{formatCurrency(data.total)}</p>
                                    <p className="text-sm text-muted-foreground">{data.count} gastos</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Expenses Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Gastos</CardTitle>
                    <CardDescription>Todos los gastos registrados</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando gastos...</div>
                    ) : !expenses || expenses.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                <IconReceipt className="h-8 w-8 text-gray-600" />
                            </div>
                            <h3 className="font-semibold mb-2">Sin gastos registrados</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Comienza a registrar los gastos del negocio.
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <IconPlus className="mr-1 h-4 w-4" />
                                Registrar Gasto
                            </Button>
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
                                    <TableHead>Deducible</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>
                                            {new Date(expense.expense_date).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">
                                            {expense.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline" 
                                                style={{ 
                                                    borderColor: expense.category?.color || '#6b7280',
                                                    color: expense.category?.color || '#6b7280'
                                                }}
                                            >
                                                {expense.category?.name || 'Sin categoría'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {expense.supplier || '-'}
                                        </TableCell>
                                        <TableCell className="font-semibold text-red-600">
                                            {formatCurrency(expense.amount)}
                                        </TableCell>
                                        <TableCell>
                                            {expense.is_tax_deductible ? (
                                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Sí</Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-gray-100 text-gray-600">No</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => handleEdit(expense)}
                                                >
                                                    <IconEdit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => deleteMutation.mutate(expense.id)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <IconTrash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Categorías</CardTitle>
                            <CardDescription>Configura las categorías para clasificar los gastos</CardDescription>
                            
                        </CardHeader>
                        <CardContent>
                            {!categories || categories.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                                        <IconCategory className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <h3 className="font-semibold mb-2">Sin categorías</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Inicializa las categorías predeterminadas o crea una nueva.
                                    </p>
                                    <div className="flex justify-center gap-2">
                                        <Button variant="outline" onClick={() => initCategoriesMutation.mutate()}>
                                            Inicializar Predeterminadas
                                        </Button>
                                        <Button onClick={() => setShowCategoryDialog(true)}>
                                            <IconPlus className="mr-1 h-4 w-4" />
                                            Crear Categoría
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Color</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell>
                                                    <div 
                                                        className="w-6 h-6 rounded-full border"
                                                        style={{ backgroundColor: category.color || '#6b7280' }}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell className="text-muted-foreground max-w-xs truncate">
                                                    {category.description || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={category.type === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                                                        {category.type === 'fixed' ? 'Fijo' : 'Variable'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => handleEditCategory(category)}
                                                        >
                                                            <IconEdit className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon"
                                                            onClick={() => setDeletingCategory(category)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <IconTrash className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create/Edit Expense Dialog */}
            <Dialog open={showCreateDialog || !!editingExpense} onOpenChange={(open) => {
                if (!open) {
                    setShowCreateDialog(false);
                    setEditingExpense(null);
                    resetForm();
                }
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {editingExpense ? 'Editar Gasto' : 'Nuevo Gasto'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingExpense ? 'Modifica los datos del gasto' : 'Registra un nuevo gasto operativo'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expense_date">Fecha</Label>
                                <Input 
                                    id="expense_date"
                                    type="date" 
                                    value={formData.expense_date}
                                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amount">Monto</Label>
                                <Input 
                                    id="amount"
                                    type="number" 
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Input 
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descripción del gasto"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Categoría</Label>
                                <Select 
                                    value={formData.category_id.toString()} 
                                    onValueChange={(value) => setFormData({ ...formData, category_id: parseInt(value) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">Método de Pago</Label>
                                <Select 
                                    value={formData.payment_method} 
                                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                                        <SelectItem value="Cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="supplier">Proveedor (Opcional)</Label>
                                <Input 
                                    id="supplier"
                                    value={formData.supplier}
                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                    placeholder="Nombre del proveedor"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="invoice_number">No. Factura (Opcional)</Label>
                                <Input 
                                    id="invoice_number"
                                    value={formData.invoice_number}
                                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                    placeholder="Número de factura"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id="is_tax_deductible"
                                checked={formData.is_tax_deductible}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_tax_deductible: !!checked })}
                            />
                            <Label htmlFor="is_tax_deductible">Deducible de impuestos</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas (Opcional)</Label>
                            <Textarea 
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notas adicionales"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCreateDialog(false);
                            setEditingExpense(null);
                            resetForm();
                        }}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || updateMutation.isPending || !formData.description || !formData.amount || !formData.category_id}
                        >
                            {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Category Dialog */}
            <Dialog open={showCategoryDialog || !!editingCategory} onOpenChange={(open) => {
                if (!open) {
                    setShowCategoryDialog(false);
                    setEditingCategory(null);
                    resetCategoryForm();
                }
            }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría de gasto'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="cat_name">Nombre</Label>
                            <Input 
                                id="cat_name"
                                value={categoryFormData.name}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                                placeholder="Nombre de la categoría"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat_description">Descripción</Label>
                            <Textarea 
                                id="cat_description"
                                value={categoryFormData.description}
                                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                                placeholder="Descripción de la categoría"
                                rows={2}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat_type">Tipo</Label>
                                <Select 
                                    value={categoryFormData.type} 
                                    onValueChange={(value) => setCategoryFormData({ ...categoryFormData, type: value as 'fixed' | 'variable' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fixed">Fijo</SelectItem>
                                        <SelectItem value="variable">Variable</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cat_color">Color</Label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        id="cat_color"
                                        type="color"
                                        value={categoryFormData.color}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input 
                                        value={categoryFormData.color}
                                        onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                                        placeholder="#6b7280"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setShowCategoryDialog(false);
                            setEditingCategory(null);
                            resetCategoryForm();
                        }}>
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handleSubmitCategory}
                            disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending || !categoryFormData.name}
                        >
                            {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category Confirmation */}
            <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará la categoría "{deletingCategory?.name}". 
                            Los gastos asociados a esta categoría podrían verse afectados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (deletingCategory) {
                                    deleteCategoryMutation.mutate(deletingCategory.id);
                                }
                            }}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
