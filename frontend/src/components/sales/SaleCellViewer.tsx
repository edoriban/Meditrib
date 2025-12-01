import { forwardRef } from "react";
import { Sale } from "@/types/sales";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface SaleCellViewerProps {
    sale: Sale;
    onUpdate?: (saleId: number, data: unknown) => void;
    onDelete?: (saleId: number) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export const SaleCellViewer = forwardRef<HTMLButtonElement, SaleCellViewerProps>(
    ({ sale }, ref) => {
        const isMobile = useIsMobile();

        const getPaymentStatusLabel = (status: string) => {
            const labels: { [key: string]: string } = {
                pending: "Pendiente",
                partial: "Parcial",
                paid: "Pagado",
                refunded: "Reembolsado",
            };
            return labels[status] || status;
        };

        const getShippingStatusLabel = (status: string) => {
            const labels: { [key: string]: string } = {
                pending: "Pendiente",
                shipped: "Enviado",
                delivered: "Entregado",
                canceled: "Cancelado",
            };
            return labels[status] || status;
        };

        return (
            <Drawer direction={isMobile ? "bottom" : "right"}>
                <DrawerTrigger asChild>
                    <Button
                        variant="link"
                        className="p-0 text-left font-medium"
                        ref={ref}
                    >
                        #{sale.id.toString().padStart(4, '0')}
                    </Button>
                </DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Pedido #{sale.id.toString().padStart(4, '0')}</DrawerTitle>
                        <DrawerDescription>
                            {new Date(sale.sale_date).toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
                        {/* Información del cliente */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                            <div>
                                <span className="text-muted-foreground text-xs">Cliente</span>
                                <p className="font-medium">{sale.client?.name || '-'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Vendedor</span>
                                <p className="font-medium">{sale.user?.name || '-'}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Estado de Pago</span>
                                <Badge variant={sale.payment_status === 'paid' ? 'default' : 'secondary'} className="mt-1">
                                    {getPaymentStatusLabel(sale.payment_status)}
                                </Badge>
                            </div>
                            <div>
                                <span className="text-muted-foreground text-xs">Estado de Envío</span>
                                <Badge variant={sale.shipping_status === 'delivered' ? 'default' : 'secondary'} className="mt-1">
                                    {getShippingStatusLabel(sale.shipping_status)}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        {/* Lista de productos */}
                        <div>
                            <h4 className="font-medium mb-2">Productos ({sale.items?.length || 0})</h4>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cant.</TableHead>
                                        <TableHead className="text-right">Precio</TableHead>
                                        <TableHead className="text-right">IVA</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items?.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{item.medicine?.name || 'Producto'}</TableCell>
                                            <TableCell className="text-right">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={item.iva_rate > 0 ? "text-amber-600" : "text-green-600"}>
                                                    {(item.iva_rate * 100).toFixed(0)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <Separator />

                        {/* Totales */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>{formatCurrency(sale.subtotal)}</span>
                            </div>
                            {sale.document_type === 'invoice' && sale.iva_amount > 0 && (
                                <div className="flex justify-between text-amber-600">
                                    <span>IVA (productos gravados):</span>
                                    <span>{formatCurrency(sale.iva_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total:</span>
                                <span>{formatCurrency(sale.total)}</span>
                            </div>
                        </div>

                        {/* Notas */}
                        {sale.notes && (
                            <>
                                <Separator />
                                <div>
                                    <span className="text-muted-foreground text-xs">Notas</span>
                                    <p className="mt-1">{sale.notes}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Cerrar</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }
);

SaleCellViewer.displayName = "SaleCellViewer";