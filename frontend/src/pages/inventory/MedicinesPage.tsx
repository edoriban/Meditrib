import { useState } from "react";
import MedicineTable from "@/components/medicines/MedicineTable";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query"
import { MedicinePaginatedResponse } from "@/types/medicine";
import { CreateMedicineTagDialog } from "@/components/medicines/CreateMedicineTagDialog"
import MedicineDashboard from "@/components/medicines/MedicineDashboard";
import { ExcelImportDialog } from "@/components/medicines/ExcelImportDialog";
import axios from "axios"
import { BASE_API_URL } from "@/config";

export default function MedicinesPage() {
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

    const { data, isLoading, error } = useQuery<MedicinePaginatedResponse>({
        queryKey: ["medicines", page, pageSize, search, stockFilter],
        queryFn: async () => {
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    page_size: pageSize.toString(),
                    stock_filter: stockFilter,
                });
                if (search) {
                    params.append("search", search);
                }
                const { data } = await axios.get(`${BASE_API_URL}/medicines/paginated?${params}`)
                console.log("Medicamentos obtenidos:", data)
                return data
            } catch (error) {
                console.error("Error fetching medicines:", error)
                throw error
            }
        }
    })

    const handleExport = () => {
        toast.success("Exportando medicamentos...");
        // TODO: Implementar lógica de exportación real aquí
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventario de Medicamentos</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los medicamentos disponibles, stock y precios.
                            {data && (
                                <span className="ml-2 font-medium">
                                    ({data.total} medicamentos en total)
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <CreateMedicineTagDialog />
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <IconDownload className="mr-1 h-4 w-4" />
                            Exportar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setImportDialogOpen(true)}>
                            <IconUpload className="mr-1 h-4 w-4" />
                            Importar Excel
                        </Button>
                    </div>
                </div>
                <MedicineDashboard medicines={data?.items} isLoading={isLoading} error={error} />
            </div>

            <MedicineTable 
                medicines={data?.items} 
                isLoading={isLoading} 
                error={error}
                // Paginación
                page={page}
                pageSize={pageSize}
                totalPages={data?.total_pages || 1}
                totalItems={data?.total || 0}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1); // Reset a página 1 al cambiar tamaño
                }}
                // Filtros del servidor
                searchTerm={search}
                onSearchChange={(term) => {
                    setSearch(term);
                    setPage(1); // Reset a página 1 al buscar
                }}
                stockFilter={stockFilter}
                onStockFilterChange={(filter) => {
                    setStockFilter(filter);
                    setPage(1);
                }}
            />

            {/* Dialog de importación Excel */}
            <ExcelImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
            />
        </div>
    );
}
