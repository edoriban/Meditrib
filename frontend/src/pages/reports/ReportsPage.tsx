import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Report } from "@/types/reports";
import { ReportsTable } from "@/components/reports/ReportsTable";
import { GenerateReportDialog } from "@/components/reports/GenerateReportDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Users, Package } from "lucide-react";
import { BASE_API_URL } from "@/config";

export default function ReportsPage() {
    const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);

    const { data, isLoading, error } = useQuery<Report[]>({
        queryKey: ["reports"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/reports/`);
            return data;
        },
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Cargando reportes...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-64 text-red-500">Error al cargar reportes</div>;
    }

    const reportTypes = [
        {
            type: "sales",
            title: "Reporte de Ventas",
            description: "Análisis de ventas por período",
            icon: TrendingUp,
        },
        {
            type: "inventory",
            title: "Reporte de Inventario",
            description: "Estado actual del inventario",
            icon: Package,
        },
        {
            type: "clients",
            title: "Reporte de Clientes",
            description: "Información de clientes activos",
            icon: Users,
        },
        {
            type: "suppliers",
            title: "Reporte de Proveedores",
            description: "Análisis de proveedores",
            icon: FileText,
        },
    ];

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Reportes</h1>
                <Button onClick={() => setIsGenerateDialogOpen(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Reporte
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {reportTypes.map((reportType) => (
                    <Card key={reportType.type} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                            <reportType.icon className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="ml-2 text-sm font-medium">
                                {reportType.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-xs">
                                {reportType.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Reportes Generados</h2>
                <ReportsTable data={data || []} />
            </div>

            <GenerateReportDialog
                open={isGenerateDialogOpen}
                onOpenChange={setIsGenerateDialogOpen}
            />
        </div>
    );
}