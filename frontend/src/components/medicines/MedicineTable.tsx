import * as React from "react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import { CreateMedicineDialog } from "@/components/medicines/CreateMedicineDialog";
import { MedicineFilters } from "@/components/medicines/MedicineFilters";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";
import { MedicineActionsMenu } from "@/components/medicines/MedicineActionsMenu";
import { MedicineCellViewer } from "@/components/medicines/MedicineCellViewer";
import { Badge } from "@/components/ui/badge";
import { Medicine } from "@/types/medicine";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MedicineTableProps {
    medicines: Medicine[] | undefined | null;
    isLoading: boolean;
    error: any;
};

const MedicineTable: React.FC<MedicineTableProps> = ({ medicines, isLoading, error }) => {
    const data = medicines;
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Valor predeterminado
    const { updateMedicine, deleteMedicine } = useMedicineMutations();
    const editRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

    const maxPrice = data ? Math.max(...data.map(medicine => medicine.sale_price), 1000) : 1000;

    const filteredData = data?.filter(medicine => {
        const matchesSearchTerm =
            searchTerm === "" ||
            medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            medicine.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStockFilter =
            stockFilter === "all" ||
            (stockFilter === "in-stock" && (medicine.inventory?.quantity || 0) > 0) ||
            (stockFilter === "out-of-stock" && (medicine.inventory?.quantity || 0) === 0);

        const matchesPriceRange =
            medicine.sale_price >= priceRange[0] &&
            medicine.sale_price <= priceRange[1];

        return matchesSearchTerm && matchesStockFilter && matchesPriceRange;
    });


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medicamentos</h2>
                <CreateMedicineDialog />
            </div>

            <MedicineFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                stockFilter={stockFilter}
                setStockFilter={setStockFilter}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                maxPrice={maxPrice}
                resultsCount={filteredData?.length || 0}
            />

            <div className="rounded-md border bg-card">
                <Tabs defaultValue="table" className="mt-4">
                    <TabsList>
                        <TabsTrigger value="table">Tabla</TabsTrigger>
                        <TabsTrigger value="chart">Análisis</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Precio de compra</TableHead>
                                    <TableHead>Precio de venta</TableHead>
                                    <TableHead>Ganancia</TableHead>
                                    <TableHead>Proveedor</TableHead>
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
                                        <TableCell className="max-w-xs truncate">{medicine.description || "—"}</TableCell>
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
                                        <TableCell>
                                            {medicine.suppliers ?
                                                (
                                                    <Badge key={medicine.suppliers.id} className="text-white bg-blue-500">
                                                        {medicine.suppliers.name}
                                                    </Badge>
                                                )
                                                : "—"}
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
                                                    <Badge variant="outline" className="ml-2 text-xs text-yellow-600 border-yellow-300">
                                                        Stock bajo
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                                    <span>0</span>
                                                    <Badge variant="destructive" className="ml-2 text-xs">
                                                        Sin stock
                                                    </Badge>
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
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={filteredData?.slice(0, 10).map(med => ({
                                        name: med.name,
                                        stock: med.inventory?.quantity || 0,
                                        profit: (med.sale_price - (med.purchase_price || 0)) * (med.inventory?.quantity || 0)
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="profit" fill="#8884d8" name="Ganancia total" />
                                    <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default MedicineTable;