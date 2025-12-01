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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IconPackage } from "@tabler/icons-react";

interface SalesTableProps {
    data: Sale[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export function SalesTable({ data, searchTerm, onSearchChange }: SalesTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const editRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

    const { deleteSale } = useSaleMutations();

    const filteredData = data.filter((sale) => {
        const searchLower = searchTerm.toLowerCase();
        // Buscar en nombre del cliente
        if (sale.client?.name?.toLowerCase().includes(searchLower)) return true;
        // Buscar en nombre del usuario
        if (sale.user?.name?.toLowerCase().includes(searchLower)) return true;
        // Buscar en ID
        if (sale.id.toString().includes(searchTerm)) return true;
        // Buscar en nombres de medicamentos de los items
        if (sale.items?.some(item => item.medicine?.name?.toLowerCase().includes(searchLower))) return true;
        return false;
    });

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

    const getStatusBadge = (status: string, type: 'payment' | 'shipping') => {
        const paymentLabels: { [key: string]: string } = {
            pending: "Pendiente",
            partial: "Parcial",
            paid: "Pagado",
            refunded: "Reembolsado",
        };
        const shippingLabels: { [key: string]: string } = {
            pending: "Pendiente",
            shipped: "Enviado",
            delivered: "Entregado",
            canceled: "Cancelado",
        };
        
        const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
            pending: "secondary",
            partial: "outline",
            paid: "default",
            shipped: "outline",
            delivered: "default",
            canceled: "destructive",
            refunded: "destructive",
        };
        
        const label = type === 'payment' ? paymentLabels[status] : shippingLabels[status];
        return <Badge variant={variants[status] || "default"}>{label || status}</Badge>;
    };

    // Obtener resumen de items para mostrar
    const getItemsSummary = (sale: Sale) => {
        if (!sale.items || sale.items.length === 0) return "Sin productos";
        if (sale.items.length === 1) {
            return `${sale.items[0].medicine?.name || 'Producto'} (${sale.items[0].quantity})`;
        }
        return `${sale.items.length} productos`;
    };

    // Obtener cantidad total de items
    const getTotalQuantity = (sale: Sale) => {
        return sale.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
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
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead className="text-right">Cantidad</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Pago</TableHead>
                            <TableHead>Envío</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                    No hay ventas registradas
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredData.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell>
                                        <SaleCellViewer
                                            sale={sale}
                                            ref={(el: HTMLButtonElement | null) => {
                                                editRefs.current[sale.id] = el;
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{sale.client?.name || '-'}</TableCell>
                                    <TableCell>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-2 cursor-help">
                                                        <IconPackage className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate max-w-[200px]">{getItemsSummary(sale)}</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom" className="max-w-xs">
                                                    <div className="space-y-1">
                                                        {sale.items?.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between gap-4 text-sm">
                                                                <span>{item.medicine?.name}</span>
                                                                <span className="text-muted-foreground">x{item.quantity}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                    <TableCell className="text-right">{getTotalQuantity(sale)}</TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(sale.total)}</TableCell>
                                    <TableCell>{getStatusBadge(sale.payment_status, 'payment')}</TableCell>
                                    <TableCell>{getStatusBadge(sale.shipping_status, 'shipping')}</TableCell>
                                    <TableCell>{new Date(sale.sale_date).toLocaleDateString('es-MX')}</TableCell>
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
                            ))
                        )}
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