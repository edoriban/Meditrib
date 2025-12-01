import { forwardRef } from "react";
import { Supplier } from "@/types/suppliers";
import { Button } from "@/components/ui/button";

interface SupplierCellViewerProps {
    supplier: Supplier;
    onUpdate?: (supplierId: number, data: any) => void;
    onDelete?: (supplierId: number) => void;
}

export const SupplierCellViewer = forwardRef<HTMLButtonElement, SupplierCellViewerProps>(
    ({ supplier }, ref) => {
        return (
            <Button
                variant="link"
                className="p-0 text-left font-medium"
                ref={ref}
            >
                {supplier.name}
            </Button>
        );
    }
);

SupplierCellViewer.displayName = "SupplierCellViewer";