import { useState, useRef } from "react";
import { Sale } from "@/types/sales";
import { useSaleMutations } from "@/hooks/useSaleMutations";
import { SaleFilters } from "./SaleFilters";
import { SaleCellViewer } from "./SaleCellViewer";
import { SaleActionsMenu } from "./SaleActionsMenu";
import { DeleteSaleDialog } from "./DeleteSaleDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SalesTableProps {
    data: Sale[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function SalesTable({ data, searchTerm, onSearchChange }: SalesTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const editRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

    const { deleteSale } = useSaleMutations();

    const filteredData = data.filter((sale) =>
        sale.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.toString().includes(searchTerm)
    );

    const handleDelete = (sale: Sale) => {
        setSaleToDelete(sale);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (saleToDelete) {
            await deleteSale(saleToDelete.id);
            setDeleteDialogOpen(false);
            setSaleToDelete(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
            pending: "secondary",
            completed: "default",
            cancelled: "destructive",
            shipped: "outline",
        };
        return <Badge variant={variants[status] || "default"}>{status}</Badge>;
    };

    return (
        <div className="space-y-4">
            <SaleFilters
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Medicamento</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado Pago</TableHead>
                            <TableHead>Estado Envío</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData?.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell>
                                    <SaleCellViewer
                                        sale={sale}
                                        ref={(el: HTMLButtonElement | null) => {
                                            editRefs.current[sale.id] = el;
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{sale.medicine.name}</TableCell>
                                <TableCell>{sale.client.name}</TableCell>
                                <TableCell>{sale.quantity}</TableCell>
                                <TableCell>${sale.total_price.toFixed(2)}</TableCell>
                                <TableCell>{getStatusBadge(sale.payment_status)}</TableCell>
                                <TableCell>{getStatusBadge(sale.shipping_status)}</TableCell>
                                <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <SaleActionsMenu
                                        sale={sale}
                                        onEdit={() => {
                                            editRefs.current[sale.id]?.click();
                                        }}
                                        onDelete={() => handleDelete(sale)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeleteSaleDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                saleId={saleToDelete?.id || 0}
            />
        </div>
    );
}