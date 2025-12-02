import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Client } from "@/types/clients";
import { BASE_API_URL } from "@/config";
import { ClientFiscalForm, FiscalFormValues } from "./ClientFiscalForm";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { IconAlertTriangle } from "@tabler/icons-react";

interface EditClientFiscalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client;
    onSuccess?: () => void;
    title?: string;
    description?: string;
}

export function EditClientFiscalDialog({
    open,
    onOpenChange,
    client,
    onSuccess,
    title = "Datos Fiscales del Cliente",
    description = "Complete los datos fiscales requeridos para poder emitir facturas."
}: EditClientFiscalDialogProps) {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateClientMutation = useMutation({
        mutationFn: async (data: FiscalFormValues) => {
            const response = await axios.put(`${BASE_API_URL}/clients/${client.id}`, {
                ...data,
                name: client.name, // Mantener el nombre actual
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client", client.id] });
            toast.success("Datos fiscales actualizados correctamente");
            onOpenChange(false);
            onSuccess?.();
        },
        onError: (error) => {
            console.error("Error al actualizar cliente:", error);
            toast.error("Error al actualizar los datos fiscales");
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const handleSubmit = (data: FiscalFormValues) => {
        setIsSubmitting(true);
        updateClientMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconAlertTriangle className="h-5 w-5 text-amber-500" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                        <br />
                        <span className="font-medium text-foreground">Cliente: {client.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <ClientFiscalForm
                    client={client}
                    onSubmit={handleSubmit}

                    showValidationStatus={true}
                />

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                            // Trigger form submission
                            const form = document.querySelector('form');
                            form?.requestSubmit();
                        }}
                    >
                        {isSubmitting ? "Guardando..." : "Guardar Datos Fiscales"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default EditClientFiscalDialog;
