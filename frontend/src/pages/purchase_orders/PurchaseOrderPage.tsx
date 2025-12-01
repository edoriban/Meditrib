import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { PurchaseOrder } from "@/types/purchase_orders";
import { PurchaseOrderTable } from "@/components/purchase_orders/PurchaseOrderTable";
import { CreatePurchaseOrderDialog } from "@/components/purchase_orders/CreatePurchaseOrderDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BASE_API_URL } from "@/config";

export default function PurchaseOrderPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<PurchaseOrder[]>({
        queryKey: ["purchase-orders"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/purchase-orders/`);
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Cargando órdenes de compra...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64 text-red-500">Error al cargar órdenes de compra</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Órdenes de Compra</h1>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Orden
                </Button>
            </div>

            <PurchaseOrderTable
                data={data || []}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <CreatePurchaseOrderDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}