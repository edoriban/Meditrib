import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/types/suppliers";

interface DeleteSupplierDialogProps {
    supplier: Supplier;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete: () => void;
    isDeleting?: boolean;
}

export function DeleteSupplierDialog({
    supplier,
    open,
    onOpenChange,
    onConfirmDelete,
    isDeleting = false
}: DeleteSupplierDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">Eliminar proveedor</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. El proveedor será eliminado permanentemente del sistema.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>
                        ¿Estás seguro que deseas eliminar el proveedor <strong>{supplier.name}</strong>?
                    </p>
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
                        {isDeleting ? "Eliminando..." : "Eliminar proveedor"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteSupplierDialog;