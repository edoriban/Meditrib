import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Medicine } from "@/types/medicine";

interface DeleteMedicineDialogProps {
    medicine: Medicine;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete: () => void;
    isDeleting?: boolean;
}

export function DeleteMedicineDialog({
    medicine,
    open,
    onOpenChange,
    onConfirmDelete,
    isDeleting = false
}: DeleteMedicineDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">Eliminar medicamento</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. El medicamento será eliminado permanentemente del sistema.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>
                        ¿Estás seguro que deseas eliminar el medicamento <strong>{medicine.name}</strong>?
                    </p>
                    {medicine.inventory && medicine.inventory.quantity > 0 && (
                        <p className="mt-2 text-amber-600">
                            ⚠️ Este medicamento tiene {medicine.inventory.quantity} unidades en inventario.
                            Al eliminarlo, también se eliminará su registro de inventario.
                        </p>
                    )}
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Eliminando..." : "Eliminar medicamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteMedicineDialog;
