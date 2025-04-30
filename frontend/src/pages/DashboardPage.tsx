import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import axios from "axios"
import { useQuery } from "@tanstack/react-query"
import { Medicine } from "@/types/medicine"

export default function DashboardPage() {
    const { data, isLoading, error } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            // No es necesario el try/catch aquí si usas las propiedades isLoading/error de useQuery
            const { data } = await axios.get("/api/v1/medicines/");
            return data;
        },
        // Opcional: Define un valor inicial para evitar el undefined temporalmente
        // initialData: []
    });

    // Manejo de estados de carga y error
    if (isLoading) {
        return <div>Cargando...</div>; // O un componente Spinner
    }

    if (error) {
        return <div>Error al cargar los datos: {error.message}</div>;
    }

    // Ahora puedes asegurar que 'data' no es undefined aquí
    // O pasar un array vacío si prefieres manejarlo en DataTable
    const tableData = data ?? [];
    return (
        <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                <DataTable data={tableData} />
            </div>
        </div>
    );
}