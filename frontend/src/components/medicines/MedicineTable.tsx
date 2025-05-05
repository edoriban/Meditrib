import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import axios from "axios"
import { BASE_API_URL } from "@/config";
import { CreateMedicineDialog } from "@/components/medicines/CreateMedicineDialog";
import { MedicineFilters } from "@/components/medicines/MedicineFilters";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";
import { MedicineActionsMenu } from "@/components/medicines/MedicineActionsMenu";
import { MedicineCellViewer } from "@/components/medicines/MedicineCellViewer";
import { Badge } from "@/components/ui/badge";
import { Medicine } from "@/types/medicine";

export function MedicineTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Valor predeterminado
    const { updateMedicine, deleteMedicine } = useMedicineMutations();
    const editRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

    const { data, isLoading, error } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            try {
                const { data } = await axios.get(`${BASE_API_URL}/medicines/`)
                console.log("Medicamentos obtenidos:", data)
                return data
            } catch (error) {
                console.error("Error fetching medicines:", error)
                throw error
            }
        }
    })

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

    if (error) {
        return <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">Error al cargar los datos: {(error as Error).message}</div>
    }

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
                                    {typeof medicine.sale_price === 'number' && typeof medicine.purchase_price === 'number'
                                        ? `$${(medicine.sale_price - medicine.purchase_price).toFixed(2)}`
                                        : "N/A"}
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
                                    {medicine.inventory?.quantity || 0}
                                    {(medicine.inventory?.quantity || 0) === 0 && (
                                        <Badge variant="destructive" className="ml-2 text-xs">
                                            Sin stock
                                        </Badge>
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
            </div>
        </div>
    )
}