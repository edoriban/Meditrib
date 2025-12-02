import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Client } from "@/types/clients";
import { BASE_API_URL } from "@/config";
import { EditClientFiscalDialog } from "@/components/clients/EditClientFiscalDialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconAlertTriangle, IconCheck, IconEdit, IconFileInvoice } from "@tabler/icons-react";

interface FiscalValidationResult {
    valid: boolean;
    errors: string[];
    client_id: number;
    client_name: string;
    can_invoice: boolean;
}

interface InvoiceValidationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client;
    onValidationSuccess: () => void;
    onCancel?: () => void;
}

export function InvoiceValidationDialog({
    open,
    onOpenChange,
    client,
    onValidationSuccess,
    onCancel
}: InvoiceValidationDialogProps) {
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Query para validar datos fiscales
    const { data: validationResult, isLoading, refetch } = useQuery<FiscalValidationResult>({
        queryKey: ["client-fiscal-validation", client.id],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/clients/${client.id}/validate-fiscal`);
            return data;
        },
        enabled: open && !!client.id,
    });

    const handleEditSuccess = () => {
        setShowEditDialog(false);
        refetch();
    };

    const handleProceed = () => {
        if (validationResult?.valid) {
            onValidationSuccess();
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={open && !showEditDialog} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconFileInvoice className="h-5 w-5" />
                            Validación para Facturación
                        </DialogTitle>
                        <DialogDescription>
                            Verificando datos fiscales del cliente: <strong>{client.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : validationResult?.valid ? (
                            <Alert className="border-green-200 bg-green-50">
                                <IconCheck className="h-4 w-4 text-green-600" />
                                <AlertTitle className="text-green-700">Datos Fiscales Completos</AlertTitle>
                                <AlertDescription className="text-green-600">
                                    El cliente tiene todos los datos fiscales necesarios para facturar.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <IconAlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Datos Fiscales Incompletos</AlertTitle>
                                    <AlertDescription>
                                        El cliente no tiene los datos fiscales completos para emitir una factura.
                                    </AlertDescription>
                                </Alert>

                                <div className="rounded-lg border p-4 space-y-2">
                                    <p className="font-medium text-sm">Datos faltantes o inválidos:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationResult?.errors.map((error, index) => (
                                            <li key={index} className="text-sm text-muted-foreground">
                                                {error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setShowEditDialog(true)}
                                >
                                    <IconEdit className="h-4 w-4 mr-2" />
                                    Completar Datos Fiscales
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        {validationResult?.valid && (
                            <Button onClick={handleProceed}>
                                <IconCheck className="h-4 w-4 mr-2" />
                                Continuar con Factura
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog para editar datos fiscales */}
            <EditClientFiscalDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                client={client}
                onSuccess={handleEditSuccess}
                title="Completar Datos Fiscales"
                description="Complete los datos fiscales requeridos para poder emitir la factura."
            />
        </>
    );
}

export default InvoiceValidationDialog;
