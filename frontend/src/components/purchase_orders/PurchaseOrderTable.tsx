import { useState, useRef } from "react";
import { PurchaseOrder } from "@/types/purchase_orders";
import { usePurchaseOrderMutations } from "@/hooks/usePurchaseOrderMutations";
import { PurchaseOrderFilters } from "./PurchaseOrderFilters";
import { PurchaseOrderCellViewer } from "./PurchaseOrderCellViewer";
import { PurchaseOrderActionsMenu } from "./PurchaseOrderActionsMenu";
import { DeletePurchaseOrderDialog } from "./DeletePurchaseOrderDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PurchaseOrderTableProps {
    data: PurchaseOrder[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function PurchaseOrderTable({ data, searchTerm, onSearchChange }: PurchaseOrderTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<PurchaseOrder | null>(null);
    const editRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

    const { updatePurchaseOrder, deletePurchaseOrder } = usePurchaseOrderMutations();

    const filteredData = data.filter((order) =>
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)
    );

    const handleDelete = (order: PurchaseOrder) => {
        setOrderToDelete(order);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (orderToDelete) {
            await deletePurchaseOrder(orderToDelete.id);
            setDeleteDialogOpen(false);
            setOrderToDelete(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
            pending: "secondary",
            approved: "default",
            delivered: "outline",
            cancelled: "destructive",
        };
        return <Badge variant={variants[status] || "default"}>{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <PurchaseOrderFilters
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead>Fecha Orden</TableHead>
                            <TableHead>Fecha Entrega Esperada</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData?.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <PurchaseOrderCellViewer
                                        order={order}
                                        ref={(el: HTMLButtonElement | null) => {
                                            editRefs.current[order.id] = el;
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{order.supplier.name}</TableCell>
                                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                <TableCell>{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : "-"}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>${order.total_amount?.toFixed(2) || "0.00"}</TableCell>
                                <TableCell>{order.items.length} items</TableCell>
                                <TableCell>
                                    <PurchaseOrderActionsMenu
                                        order={order}
                                        onEdit={() => {
                                            editRefs.current[order.id]?.click();
                                        }}
                                        onDelete={() => handleDelete(order)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeletePurchaseOrderDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                orderId={orderToDelete?.id || 0}
            />
        </div>
    );
}