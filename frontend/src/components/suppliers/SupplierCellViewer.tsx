import { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Supplier } from "@/types/suppliers";
import { Button } from "@/components/ui/button";
import { EditSupplierDialog } from "./EditSupplierDialog";

interface SupplierCellViewerProps {
    supplier: Supplier;
    onUpdate?: (supplierId: number, data: any) => void;
    onDelete?: (supplierId: number) => void;
}

export const SupplierCellViewer = forwardRef<HTMLButtonElement, SupplierCellViewerProps>(
    ({ supplier }, ref) => {
        const [editDialogOpen, setEditDialogOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);

        // Exponer el método click al ref externo
        useImperativeHandle(ref, () => ({
            ...buttonRef.current!,
            click: () => setEditDialogOpen(true),
        }));

        return (
            <>
                <Button
                    variant="link"
                    className="p-0 text-left font-medium"
                    ref={buttonRef}
                    onClick={() => setEditDialogOpen(true)}
                >
                    {supplier.name}
                </Button>

                <EditSupplierDialog
                    supplier={supplier}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                />
            </>
        );
    }
);

SupplierCellViewer.displayName = "SupplierCellViewer";