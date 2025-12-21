import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Sale } from "@/types/sales";
import { SalesTable } from "@/components/sales/SalesTable";
import { CreateSaleDialog } from "@/components/sales/CreateSaleDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BASE_API_URL } from "@/config";

export default function SalesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<Sale[]>({
        queryKey: ["sales"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/sales/`);
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Cargando ventas...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64 text-red-500">Error al cargar ventas</div>;
    }

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona tus ventas y transacciones.
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Venta
                </Button>
            </div>

            <SalesTable
                data={data || []}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <CreateSaleDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}