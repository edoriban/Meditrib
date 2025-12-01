import { forwardRef } from "react";
import { PurchaseOrder } from "@/types/purchase_orders";
import { Button } from "@/components/ui/button";

interface PurchaseOrderCellViewerProps {
    order: PurchaseOrder;
    onUpdate?: (orderId: number, data: any) => void;
    onDelete?: (orderId: number) => void;
}

export const PurchaseOrderCellViewer = forwardRef<HTMLButtonElement, PurchaseOrderCellViewerProps>(
    ({ order }, ref) => {
        return (
            <Button
                variant="link"
                className="p-0 text-left font-medium"
                ref={ref}
            >
                #{order.id}
            </Button>
        );
    }
);

PurchaseOrderCellViewer.displayName = "PurchaseOrderCellViewer";