import { useState } from "react";
import ProductTable from "@/components/products/ProductTable";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query"
import { ProductPaginatedResponse } from "@/types/product";
import { CreateProductTagDialog } from "@/components/products/CreateProductTagDialog"
import ProductDashboard from "@/components/products/ProductDashboard";
import { ExcelImportDialog } from "@/components/products/ExcelImportDialog";
import axios from "axios"
import { BASE_API_URL } from "@/config";

export default function ProductsPage() {
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(50);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

    const { data, isLoading, error } = useQuery<ProductPaginatedResponse>({
        queryKey: ["products", page, pageSize, search, stockFilter],
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
                const { data } = await axios.get(`${BASE_API_URL}/products/paginated?${params}`)
                return data
            } catch (error) {
                console.error("Error fetching products:", error)
                throw error
            }
        }
    })

    const handleExport = async () => {
        try {
            toast.info("Generando archivo Excel...");

            // Descargar el archivo Excel del backend
            const response = await axios.get(`${BASE_API_URL}/products/export/excel`, {
                responseType: 'blob'
            });

            // Crear URL para descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Obtener nombre del archivo del header o usar uno por defecto
            const contentDisposition = response.headers['content-disposition'];
            let filename = `Catalogo_Productos_${new Date().toISOString().split('T')[0]}.xlsx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename=(.+)/);
                if (filenameMatch) {
                    filename = filenameMatch[1].replace(/"/g, '');
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success("Catálogo exportado correctamente");
        } catch (error) {
            console.error("Error al exportar:", error);
            toast.error("Error al exportar el catálogo");
        }
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventario de Productos</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los productos disponibles, stock y precios.
                            {data && (
                                <span className="ml-2 font-medium">
                                    ({data.total} productos en total)
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <CreateProductTagDialog />
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
                <ProductDashboard products={data?.items} isLoading={isLoading} error={error} />
            </div>

            <ProductTable
                products={data?.items}
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
