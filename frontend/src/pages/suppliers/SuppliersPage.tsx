import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { Supplier } from "@/types/suppliers";
import SuppliersTable from "@/components/suppliers/SuppliersTable";
import CreateSupplierDialog from "@/components/suppliers/CreateSupplierDialog";

export default function SuppliersPage() {
    const { data, isLoading, error } = useQuery<Supplier[]>({
        queryKey: ["suppliers"],
        queryFn: async () => {
            try {
                const { data } = await axios.get(`${BASE_API_URL}/suppliers/`);
                return data;
            } catch (error) {
                console.error("Error fetching suppliers:", error);
                throw error;
            }
        }
    });

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los proveedores de medicamentos.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <CreateSupplierDialog />
                    </div>
                </div>
            </div>

            <SuppliersTable suppliers={data} isLoading={isLoading} error={error} />
        </div>
    );
}