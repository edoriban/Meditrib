import * as React from "react";
import { useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import { CreateMedicineDialog } from "@/components/medicines/CreateMedicineDialog";
import { MedicineFilters } from "@/components/medicines/MedicineFilters";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";
import { MedicineActionsMenu } from "@/components/medicines/MedicineActionsMenu";
import { MedicineCellViewer } from "@/components/medicines/MedicineCellViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Medicine } from "@/types/medicine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip, ScatterChart, ZAxis, Scatter, ReferenceLine, Treemap, PieChart, Pie, ComposedChart, Cell, Line, ReferenceArea } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig
} from "@/components/ui/chart";

interface MedicineTableProps {
    medicines: Medicine[] | undefined | null;
    isLoading: boolean;
    error: any;
    // Props de paginación
    page?: number;
    pageSize?: number;
    totalPages?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    // Props de filtros del servidor
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    stockFilter?: "all" | "in-stock" | "out-of-stock";
    onStockFilterChange?: (filter: "all" | "in-stock" | "out-of-stock") => void;
};


const MedicineTable: React.FC<MedicineTableProps> = ({
    medicines,
    isLoading,
    // Paginación
    page = 1,
    pageSize = 50,
    totalPages = 1,
    totalItems = 0,
    onPageChange,
    onPageSizeChange,
    // Filtros del servidor
    searchTerm = "",
    onSearchChange,
    stockFilter = "all",
    onStockFilterChange,
}) => {
    const data = medicines;
    const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 10000]);
    const { updateMedicine, deleteMedicine } = useMedicineMutations();
    const editRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

    const scatterConfig = {
        inventory: {
            label: "Unidades en stock",
            color: "hsl(215 70% 60%)"
        },
        margin: {
            label: "Margen de ganancia (%)",
            color: "hsl(142 76% 36%)"
        },
        totalValue: {
            label: "Valor en inventario",
            color: "hsl(262 83% 58%)"
        }
    } satisfies ChartConfig;

    const treeMapConfig = {
        value: {
            label: "Valor en inventario ($)",
            color: "hsl(215 70% 60%)"
        },
        inventory: {
            label: "Unidades en stock",
            color: "hsl(142 76% 36%)"
        },
        profit: {
            label: "Ganancia potencial",
            color: "hsl(262 83% 58%)"
        }
    } satisfies ChartConfig;

    const comboConfig = {
        turnover: {
            label: "Rotación mensual",
            color: "hsl(215 70% 60%)"
        },
        margin: {
            label: "Margen de ganancia (%)",
            color: "hsl(350 80% 55%)"
        }
    } satisfies ChartConfig;

    const replenishConfig = {
        currentStock: {
            label: "Stock actual",
            color: "hsl(215 70% 60%)"
        },
        optimalStock: {
            label: "Stock óptimo",
            color: "hsl(142 40% 55%)"
        }
    } satisfies ChartConfig;

    const abcConfig = {
        value: {
            label: "Valor del inventario",
            color: "hsl(215 70% 60%)"
        }
    } satisfies ChartConfig;

    const priceEfficiencyConfig = {
        price: {
            label: "Precio de venta",
            color: "hsl(262 83% 58%)" // Púrpura
        },
        margin: {
            label: "Margen de ganancia (%)",
            color: "hsl(350 80% 55%)" // Rojo
        },
        sales: {
            label: "Ventas estimadas",
            color: "hsl(215 70% 60%)" // Azul
        }
    } satisfies ChartConfig;

    const maxPrice = data ? Math.max(...data.map(medicine => medicine.sale_price), 1000) : 1000;

    const calculateMargin = useCallback((med: Medicine) => {
        if (!med.purchase_price || med.purchase_price <= 0) return 0;
        return Number(((med.sale_price - med.purchase_price) / med.purchase_price * 100).toFixed(2));
    }, []);

    const calculateInventoryValue = useCallback((med: Medicine) => {
        const price = med.purchase_price || med.sale_price || 0;
        return (med.inventory?.quantity || 0) * price;
    }, []);

    // Los filtros de búsqueda y stock ahora vienen del servidor
    // Solo aplicamos filtro de precio en el cliente (opcional)
    const filteredData = data?.filter(medicine => {
        const matchesPriceRange =
            medicine.sale_price >= priceRange[0] &&
            medicine.sale_price <= priceRange[1];

        return matchesPriceRange;
    });

    const maxMargin = React.useMemo(() => {
        if (!filteredData) return 100;
        const max = Math.max(...filteredData
            .filter(med => med.purchase_price && med.purchase_price > 0)
            .map(med => (med.sale_price - med.purchase_price) / med.purchase_price * 100)
        );
        return Math.max(100, Math.ceil(max * 1.1)); // +10% para espacio extra
    }, [filteredData]);

    // Datos para el TreeMap
    const treemapData = React.useMemo(() => {
        if (!filteredData) return [];

        // Filtrar solo productos con stock
        const itemsWithStock = filteredData.filter(med => (med.inventory?.quantity || 0) > 0);

        return itemsWithStock
            .map(med => {
                const margin = Number(calculateMargin(med)); // Explícitamente convertir a número
                const inventory = med.inventory?.quantity || 0;
                const value = calculateInventoryValue(med);
                const profit = (med.sale_price - (med.purchase_price || 0)) * inventory;

                // Asegurar que el valor nunca sea 0 o negativo (mínimo 0.01)
                const safeValue = value <= 0 ? 0.01 : value;

                // En una app real, obtendría esta fecha de la API
                const daysUntilExpiry = Math.floor(Math.random() * 300) + 10;

                // Determinar color según margen y días hasta expiración
                let fillColor = "#3b82f6"; // azul por defecto

                if (daysUntilExpiry < 30) {
                    fillColor = "#ef4444"; // rojo si está próximo a expirar
                } else if (margin < 15) {
                    fillColor = "#f97316"; // naranja si rentabilidad baja
                } else if (margin > 30) {
                    fillColor = "#22c55e"; // verde si rentabilidad alta
                }

                return {
                    name: med.name,
                    value: safeValue, // Usar el valor seguro
                    inventory,
                    margin,
                    profit,
                    daysUntilExpiry,
                    fillColor
                };
            })
            .sort((a, b) => b.value - a.value);
    }, [filteredData, calculateMargin, calculateInventoryValue]);

    // Datos para gráfico de clasificación ABC
    const abcAnalysis = React.useMemo(() => {
        if (!filteredData) return [];

        // Ordenar por valor del inventario
        const sortedByValue = [...filteredData]
            .filter(med => (med.inventory?.quantity || 0) > 0)
            .map(med => ({
                id: med.id,
                name: med.name,
                value: calculateInventoryValue(med)
            }))
            .sort((a, b) => b.value - a.value);

        const totalValue = sortedByValue.reduce((sum, item) => sum + item.value, 0);

        // Calcular valor acumulado y asignar clase (A, B, o C)
        let accumulatedValue = 0;
        const classified = sortedByValue.map(item => {
            accumulatedValue += item.value;
            const percentage = (accumulatedValue / totalValue) * 100;

            let productClass;
            if (percentage <= 80) {
                productClass = "A";
            } else if (percentage <= 95) {
                productClass = "B";
            } else {
                productClass = "C";
            }

            return {
                ...item,
                percentage,
                class: productClass
            };
        });

        // Agrupar por clase
        const classA = classified.filter(item => item.class === "A");
        const classB = classified.filter(item => item.class === "B");
        const classC = classified.filter(item => item.class === "C");

        // Calcular valores totales por clase
        const classAValue = classA.reduce((sum, item) => sum + item.value, 0);
        const classBValue = classB.reduce((sum, item) => sum + item.value, 0);
        const classCValue = classC.reduce((sum, item) => sum + item.value, 0);

        return [
            {
                name: `Clase A (${classA.length} productos)`,
                value: classAValue,
                color: "#ef4444", // rojo: alta prioridad
                percentage: (classAValue / totalValue) * 100
            },
            {
                name: `Clase B (${classB.length} productos)`,
                value: classBValue,
                color: "#f97316", // naranja: media prioridad
                percentage: (classBValue / totalValue) * 100
            },
            {
                name: `Clase C (${classC.length} productos)`,
                value: classCValue,
                color: "#3b82f6", // azul: baja prioridad
                percentage: (classCValue / totalValue) * 100
            }
        ];
    }, [filteredData, calculateInventoryValue]);

    // Datos para rotación vs rentabilidad
    const topPerformers = React.useMemo(() => {
        if (!filteredData) return [];

        // En un caso real, la rotación vendría de datos históricos de ventas
        // Aquí simulamos datos de rotación basados en el stock
        return filteredData
            .filter(med => (med.inventory?.quantity || 0) > 0)
            .map(med => {
                const turnover = Math.max(1, Math.floor(10 / ((med.inventory?.quantity || 1) * 0.2)));
                return {
                    name: med.name.length > 15 ? `${med.name.substring(0, 15)}...` : med.name,
                    turnover,
                    margin: calculateMargin(med)
                };
            })
            .sort((a, b) => (b.turnover * b.margin) - (a.turnover * a.margin))
            .slice(0, 8);
    }, [filteredData, calculateMargin]);

    // Datos para necesidad de reposición
    const needsReplenishment = React.useMemo(() => {
        if (!filteredData) return [];

        // Filtrar medicamentos con stock bajo y ordenar por prioridad
        return filteredData
            .filter(med => {
                const stock = med.inventory?.quantity || 0;
                return stock < 15;
            })
            .map(med => {
                // Estimación simple del stock óptimo 
                // En un caso real, esto vendría de un algoritmo más sofisticado
                const margin = calculateMargin(med);
                const currentStock = med.inventory?.quantity || 0;
                const estimatedSales = margin > 25 ? 15 : margin > 10 ? 10 : 5;
                const optimalStock = estimatedSales * 2;

                return {
                    name: med.name.length > 15 ? `${med.name.substring(0, 15)}...` : med.name,
                    currentStock,
                    optimalStock
                };
            })
            .sort((a, b) => a.currentStock - b.currentStock)
            .slice(0, 8);
    }, [filteredData, calculateMargin]);

    const priceEfficiencyData = React.useMemo(() => {
        if (!filteredData) return [];

        return filteredData
            .filter(med => med.purchase_price && med.purchase_price > 0)
            .map(med => {
                // Simulamos datos de ventas - en una aplicación real vendrían del historial
                const estimatedSales =
                    (med.inventory?.quantity || 0) < 10 ? 15 : // Poco inventario = muchas ventas
                        (med.inventory?.quantity || 0) < 20 ? 10 : // Inventario medio = ventas medias
                            5; // Alto inventario = pocas ventas

                return {
                    name: med.name,
                    price: med.sale_price,
                    margin: calculateMargin(med),
                    sales: estimatedSales,
                    supplier: med.suppliers?.name || "Sin proveedor"
                };
            })
            .sort((a, b) => b.sales - a.sales)
            .slice(0, 20); // Mostrar solo los 20 más relevantes
    }, [filteredData, calculateMargin]);

    // Calcular el umbral de precio para la línea de referencia
    const priceThreshold = React.useMemo(() => {
        if (!filteredData?.length) return 50;
        const avgPrice = filteredData.reduce((sum, med) => sum + med.sale_price, 0) / filteredData.length;
        return Math.max(50, avgPrice);
    }, [filteredData]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medicamentos</h2>
                <CreateMedicineDialog />
            </div>

            <MedicineFilters
                searchTerm={searchTerm}
                setSearchTerm={onSearchChange || (() => { })}
                stockFilter={stockFilter}
                setStockFilter={onStockFilterChange || (() => { })}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
                resultsCount={totalItems}
            />

            {/* Controles de paginación */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Mostrando {filteredData?.length || 0} de {totalItems} medicamentos</span>
                    <span>|</span>
                    <span>Página {page} de {totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Por página:</span>
                    <Select
                        value={pageSize.toString()}
                        onValueChange={(val) => onPageSizeChange?.(parseInt(val))}
                    >
                        <SelectTrigger className="w-[80px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange?.(1)}
                            disabled={page <= 1}
                        >
                            <IconChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange?.(page - 1)}
                            disabled={page <= 1}
                        >
                            <IconChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange?.(page + 1)}
                            disabled={page >= totalPages}
                        >
                            <IconChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onPageChange?.(totalPages)}
                            disabled={page >= totalPages}
                        >
                            <IconChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Tabs defaultValue="table" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="table">Tabla</TabsTrigger>
                        <TabsTrigger value="chart">Matriz de decisiones</TabsTrigger>
                        <TabsTrigger value="capital">Capital invertido</TabsTrigger>
                        <TabsTrigger value="kpi">KPIs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Ingrediente Activo</TableHead>
                                    <TableHead>Precio de compra</TableHead>
                                    <TableHead>Precio de venta</TableHead>
                                    <TableHead>Ganancia</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredData?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                            No hay medicamentos que coincidan con los filtros
                                        </TableCell>
                                    </TableRow>
                                ) : filteredData?.map((medicine) => (
                                    <TableRow key={medicine.id}>
                                        <TableCell>
                                            <MedicineCellViewer
                                                medicine={medicine}
                                                onUpdate={(medicineId, data) => updateMedicine(medicineId, data)}
                                                onDelete={(medicineId) => deleteMedicine(medicineId)}
                                                ref={(el) => {
                                                    editRefs.current[medicine.id] = el;
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{medicine.active_substance || "—"}</TableCell>
                                        <TableCell>
                                            {typeof medicine.purchase_price === 'number'
                                                ? `$${medicine.purchase_price.toFixed(2)}`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>${medicine.sale_price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {typeof medicine.sale_price === 'number' && typeof medicine.purchase_price === 'number' ? (
                                                <div className="flex items-center">
                                                    <span>${(medicine.sale_price - medicine.purchase_price).toFixed(2)}</span>
                                                    {((medicine.sale_price - medicine.purchase_price) / medicine.purchase_price * 100) > 30 ? (
                                                        <Badge className="ml-2 bg-green-100 text-green-800 border-0">
                                                            Alta
                                                        </Badge>
                                                    ) : ((medicine.sale_price - medicine.purchase_price) / medicine.purchase_price * 100) > 15 ? (
                                                        <Badge className="ml-2 bg-blue-100 text-blue-800 border-0">
                                                            Normal
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="ml-2 bg-orange-100 text-orange-800 border-0">
                                                            Baja
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : "N/A"}
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {(medicine.inventory?.quantity || 0) > 10 ? (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                                    <span>{medicine.inventory?.quantity || 0}</span>
                                                </div>
                                            ) : (medicine.inventory?.quantity || 0) > 0 ? (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                                    <span>{medicine.inventory?.quantity || 0}</span>

                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                                    <span>0</span>

                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {medicine.tags && medicine.tags.length > 0 ? (
                                                    medicine.tags.map((tag: any) => (
                                                        <Badge
                                                            key={tag.id}
                                                            style={{ backgroundColor: tag.color || "#6366f1" }}
                                                            className="text-white"
                                                        >
                                                            {tag.name}
                                                        </Badge>
                                                    ))
                                                ) : "—"}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <MedicineActionsMenu
                                                medicine={medicine}
                                                onDelete={() => deleteMedicine(medicine.id)}
                                                onEdit={() => {
                                                    if (editRefs.current[medicine.id]) {
                                                        editRefs.current[medicine.id]?.click();
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="chart">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-2">Matriz de oportunidad de productos</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Analiza medicamentos por margen de ganancia y nivel de inventario
                            </p>
                            <div className="min-h-[500px] w-full">
                                {filteredData?.length ? (
                                    <ChartContainer
                                        config={scatterConfig}
                                        className="h-[700px] w-full rounded-lg bg-muted/20"
                                    >
                                        <ScatterChart
                                            accessibilityLayer
                                            margin={{ top: 40, right: 40, left: 60, bottom: 60 }}

                                        >
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.9} />
                                            <XAxis
                                                type="number"
                                                dataKey="inventory"
                                                name=" Inventario"
                                                label={{ value: 'Unidades en inventario', position: 'bottom', dy: 20 }}
                                                domain={[0, (dataMax: number) => Math.max(100, dataMax * 1.1)]}
                                                allowDataOverflow={true}
                                                tickCount={6}
                                                scale={filteredData.some(med => (med.inventory?.quantity ?? 0) > 200) ? "log" : "linear"}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="margin"
                                                name=" Margen"
                                                label={{ value: 'Margen (%)', angle: -90, position: 'insideLeft', dx: -20 }}
                                                domain={[0, (maxMargin: number) => Number((Math.max(100, maxMargin * 1.1)).toFixed(2))]}
                                                allowDataOverflow={true}
                                                tickCount={6}
                                            />

                                            <ZAxis
                                                type="number"
                                                dataKey="totalValue"
                                                range={[30, 80]}
                                                name=" Valor total"
                                            />
                                            {/* Cuadrantes de fondo */}
                                            <ReferenceArea
                                                x1={0}
                                                x2={10}
                                                y1={0}
                                                y2={20}
                                                fill="rgba(244, 63, 94, 0.3)"
                                                strokeOpacity={0}
                                                ifOverflow="visible"
                                                z={-1}
                                                label={{
                                                    value: "Acciones urgentes",
                                                    position: "center",
                                                    fontSize: 11,
                                                    fill: "#888888"
                                                }}
                                            />
                                            <ReferenceArea
                                                x1={0}
                                                x2={10}
                                                y1={20}
                                                y2={maxMargin}
                                                fill="rgba(250, 204, 21, 0.3)"
                                                strokeOpacity={0}
                                                ifOverflow="visible"
                                                z={-1}
                                                label={{
                                                    value: "Revisar precios",
                                                    position: "insideTopRight",
                                                    fontSize: 10,
                                                    fill: "#888888"
                                                }}
                                            />
                                            <ReferenceArea
                                                x1={10}
                                                x2={100}
                                                y1={0}
                                                y2={20}
                                                fill="rgba(34, 211, 238, 0.3)"
                                                strokeOpacity={0}
                                                ifOverflow="visible"
                                                z={-1}
                                                label={{
                                                    value: "Priorizar ventas",
                                                    position: "insideBottomLeft",
                                                    fontSize: 10,
                                                    fill: "#888888"
                                                }}
                                            />
                                            <ReferenceArea
                                                x1={10}
                                                x2={100}
                                                y1={20}
                                                y2={maxMargin}
                                                fill="rgba(34, 197, 94, 0.3)"
                                                strokeOpacity={0}
                                                ifOverflow="visible"
                                                z={-1}
                                                label={{
                                                    value: "Productos estrella",
                                                    position: "insideTopLeft",
                                                    fontSize: 10,
                                                    fill: "#888888"
                                                }}
                                            />
                                            <ChartTooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(value, name, props) => {
                                                            if (name === "name") return [props.payload.name, "Producto"];
                                                            if (name === "margin") return [`${Number(value).toFixed(2)}%`, " Margen de ganancia"];
                                                            if (name === "inventory") return [value, " Unidades"];
                                                            if (name === "totalValue") return [`$${Number(value).toFixed(2)}`, " Valor en inventario"];
                                                            return [value, name];
                                                        }}
                                                        labelFormatter={(_label, props) => {
                                                            return props[0]?.payload?.name || "";;
                                                        }}
                                                    />
                                                }
                                            />
                                            <Scatter
                                                data={
                                                    filteredData.map(med => ({
                                                        name: med.name,
                                                        inventory: med.inventory?.quantity || 0,
                                                        margin: (med.purchase_price && med.purchase_price > 0)
                                                            ? Number(((med.sale_price - med.purchase_price) / med.purchase_price * 100).toFixed(2))
                                                            : 0,
                                                        totalValue: Number(((med.inventory?.quantity || 0) * (med.purchase_price || med.sale_price)).toFixed(2)),
                                                    }))
                                                }
                                                name="Productos"
                                                fill="#3b82f6"
                                                legendType="circle"
                                                radius={4}
                                                shape={(props: any) => {
                                                    const { cx, cy, fill, payload } = props;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={6}
                                                            fill={fill}
                                                            stroke="#fff"
                                                            strokeWidth={2}
                                                        >
                                                            <title>{payload.name}</title>
                                                        </circle>
                                                    );
                                                }}
                                            />
                                            {/* Cuadrantes */}
                                            <ReferenceLine y={20} stroke="#888" strokeDasharray="3 3" />
                                            <ReferenceLine x={10} stroke="#888" strokeDasharray="3 3" />



                                        </ScatterChart>
                                    </ChartContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-[500px] bg-muted/20 rounded-lg">
                                        <p className="text-muted-foreground">No hay datos para mostrar</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="capital">
                        <div className="p-6">
                            <h3 className="text-lg font-medium mb-2">Distribución de capital en inventario</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Identifica dónde está concentrado tu capital y qué productos requieren acción
                            </p>
                            <div className="min-h-[500px] w-full">
                                <ChartContainer
                                    config={treeMapConfig}
                                    className="h-[500px] w-full rounded-lg bg-muted/20"
                                >
                                    <div className="relative w-full h-full">
                                        {/* Verificar si hay datos para mostrar */}
                                        {treemapData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <Treemap
                                                    data={treemapData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    aspectRatio={4 / 3}
                                                    isAnimationActive={true}
                                                    animationDuration={300}
                                                    animationEasing="ease-in-out"

                                                >
                                                    {treemapData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={entry.fillColor}
                                                            stroke="#fff"
                                                        />
                                                    ))}
                                                    <Tooltip
                                                        formatter={(_value, _name, props) => {
                                                            const item = props.payload;
                                                            return [
                                                                <div className="p-2">
                                                                    <div className="font-bold">{item.name}</div>
                                                                    <div>Valor: ${Number(item.value).toFixed(2)}</div>
                                                                    <div>Unidades: {item.inventory}</div>
                                                                    <div>Margen: {item.margin}%</div>
                                                                    <div>Ganancia: ${Number(item.profit).toFixed(2)}</div>
                                                                    <div className={item.daysUntilExpiry < 30 ? "text-red-500 font-bold" : ""}>
                                                                        {item.daysUntilExpiry < 30
                                                                            ? `¡Expira en ${item.daysUntilExpiry} días!`
                                                                            : `Expira en ${item.daysUntilExpiry} días`}

                                                                    </div>
                                                                </div>
                                                            ];
                                                        }}
                                                    />
                                                </Treemap>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <p className="text-muted-foreground">No hay datos suficientes para mostrar</p>
                                            </div>
                                        )}
                                    </div>
                                </ChartContainer>
                            </div>

                            {/* Agregar leyenda explicativa */}
                            <div className="flex flex-wrap gap-2 mt-3 justify-center">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-[#ef4444] mr-1" />
                                    <span className="text-xs">Expiración próxima</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-[#f97316] mr-1" />
                                    <span className="text-xs">Margen bajo</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-[#22c55e] mr-1" />
                                    <span className="text-xs">Margen alto</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-[#3b82f6] mr-1" />
                                    <span className="text-xs">Estándar</span>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="kpi">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Rotación vs. Rentabilidad</h3>
                                <div className="h-[300px] rounded-lg bg-muted/20">
                                    <ChartContainer config={comboConfig} className="h-full">
                                        <ComposedChart data={topPerformers}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" scale="band" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar yAxisId="left" dataKey="turnover" fill="var(--color-turnover)" radius={[4, 4, 0, 0]} />
                                            <Line yAxisId="right" dataKey="margin" stroke="var(--color-margin)" />
                                        </ComposedChart>
                                    </ChartContainer>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Los productos con alta rotación y alto margen son los más rentables.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Necesidad de reposición</h3>
                                <div className="h-[300px] rounded-lg bg-muted/20">
                                    <ChartContainer config={replenishConfig} className="h-full">
                                        <BarChart data={needsReplenishment}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="currentStock" fill="var(--color-currentStock)" />
                                            <Bar dataKey="optimalStock" fill="var(--color-optimalStock)" />
                                            <ReferenceLine y={5} stroke="#ff4d4f" strokeDasharray="3 3" />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Productos por debajo de la línea roja requieren reposición urgente.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">Clasificación ABC de inventario</h3>
                                <div className="h-[350px] rounded-lg bg-muted/20">
                                    <ChartContainer config={abcConfig} className="h-full">
                                        <PieChart>
                                            <Pie
                                                data={abcAnalysis}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={140}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                            >
                                                {abcAnalysis.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                        </PieChart>
                                    </ChartContainer>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Clase A: 80% del valor, Clase B: 15% del valor, Clase C: 5% del valor.

                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Enfoca tu atención en los productos de Clase A.
                                </p>
                            </div>

                            {/* Nueva gráfica: Análisis de eficiencia de precios */}
                            <div>
                                <h3 className="text-lg font-medium mb-2">Eficiencia de precios</h3>
                                <div className="h-[360px] rounded-lg bg-muted/20">
                                    <ChartContainer config={priceEfficiencyConfig} className="h-full">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                            <XAxis
                                                dataKey="price"
                                                name="Precio ($)"
                                                label={{ value: 'Precio de venta ($)', position: 'bottom', dy: 20 }}
                                            />
                                            <YAxis
                                                dataKey="margin"
                                                name="Margen (%)"
                                                label={{ value: 'Margen (%)', angle: -90, position: 'insideLeft', dx: -20 }}
                                            />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Scatter
                                                data={priceEfficiencyData}
                                                fill="var(--color-price)"
                                                shape={(props: any) => {
                                                    const { cx, cy, fill, payload } = props;
                                                    let size = 8;
                                                    if (payload.sales > 10) size = 12;
                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={size}
                                                            stroke="#fff"
                                                            strokeWidth={1}
                                                            fill={fill}
                                                            opacity={0.75}
                                                        />
                                                    );
                                                }}
                                            />
                                            <ReferenceLine y={20} stroke="#888" strokeDasharray="3 3" />
                                            <ReferenceLine x={priceThreshold} stroke="#888" strokeDasharray="3 3" />
                                        </ScatterChart>
                                    </ChartContainer>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Identifica productos con precios óptimos o necesidad de reajuste. El tamaño indica las ventas.
                                </p>
                            </div>


                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Paginación inferior */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({totalItems} medicamentos)
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(page - 1)}
                        disabled={page <= 1}
                    >
                        <IconChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(page + 1)}
                        disabled={page >= totalPages}
                    >
                        Siguiente
                        <IconChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MedicineTable;