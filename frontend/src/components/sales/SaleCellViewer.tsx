import { forwardRef } from "react";
import { Sale } from "@/types/sales";
import { Button } from "@/components/ui/button";

interface SaleCellViewerProps {
    sale: Sale;
    onUpdate?: (saleId: number, data: any) => void;
    onDelete?: (saleId: number) => void;
}

export const SaleCellViewer = forwardRef<HTMLButtonElement, SaleCellViewerProps>(
    ({ sale }, ref) => {
        return (
            <Button
                variant="link"
                className="p-0 text-left font-medium"
                ref={ref}
            >
                #{sale.id}
            </Button>
        );
    }
);

SaleCellViewer.displayName = "SaleCellViewer";