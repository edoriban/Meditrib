import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { AlertsList } from "@/components/alerts/AlertsList";
import { InvoicesList } from "@/components/invoices/InvoicesList";
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Medicine } from "@/types/medicine"

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            const { data } = await axios.get("/api/v1/medicines/");
            return data;
        },
    });

    if (isLoading) {
        return <div>Cargando...</div>;
    }

    if (error) {
        return <div>Error al cargar los datos: {error.message}</div>;
    }

    const tableData = data ?? [];
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                    <AlertsList />
                </div>
                <div className="px-4 lg:px-6">
                    <InvoicesList />
                </div>
                <SectionCards />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                <DataTable data={tableData} />
            </div>
        </div>
    );
}