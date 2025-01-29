import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export function ReportCards() {
    const handleGenerateExcel = () => {
        // Lógica para generar Excel
        console.log("Generando Excel...");
    };

    const handleGeneratePDF = () => {
        // Lógica para generar PDF
        console.log("Generando PDF...");
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle>Reporte de Inventario</CardTitle>
                    <CardDescription>Genera un reporte en formato Excel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGenerateExcel}>Generar Excel</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Reporte de Ventas</CardTitle>
                    <CardDescription>Genera un reporte en formato PDF.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleGeneratePDF}>Generar PDF</Button>
                </CardContent>
            </Card>
        </div>
    );
}