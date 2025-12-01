import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Client } from "@/types/clients";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { CreateClientDialog } from "@/components/clients/CreateClientDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BASE_API_URL } from "@/config";

export default function ClientsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<Client[]>({
        queryKey: ["clients"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/clients/`);
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Cargando clientes...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64 text-red-500">Error al cargar clientes</div>;
    }

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clientes</h1>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            <ClientsTable
                data={data || []}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <CreateClientDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    );
}