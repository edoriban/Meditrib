import { MedicineTable } from "@/components/medicines/MedicineTable";
import { Button } from "@/components/ui/button";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";

export default function MedicinesPage() {
    const handleExport = () => {
        toast.success("Exportando medicamentos...");
        // Implementar lógica de exportación real aquí
    };

    const handleImport = () => {
        toast.success("Importando medicamentos...");
        // Implementar lógica de importación real aquí
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Inventario de Medicamentos</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los medicamentos disponibles, stock y precios.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <IconDownload className="mr-1 h-4 w-4" />
                            Exportar
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleImport}>
                            <IconUpload className="mr-1 h-4 w-4" />
                            Importar
                        </Button>
                    </div>
                </div>
            </div>

            <MedicineTable />
        </div>
    );
}
