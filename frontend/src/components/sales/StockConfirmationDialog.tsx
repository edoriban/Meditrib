import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { IconAlertTriangle, IconPackage } from "@tabler/icons-react";

interface StockIssue {
    medicine_id: number;
    medicine_name: string;
    requested: number;
    available: number;
    shortage: number;
}

interface StockConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stockIssues: StockIssue[];
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function StockConfirmationDialog({
    open,
    onOpenChange,
    stockIssues,
    onConfirm,
    onCancel,
    isLoading = false
}: StockConfirmationDialogProps) {
    const totalShortage = stockIssues.reduce((sum, issue) => sum + issue.shortage, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconAlertTriangle className="h-5 w-5 text-amber-500" />
                        Stock Insuficiente
                    </DialogTitle>
                    <DialogDescription>
                        Algunos productos no tienen suficiente stock para completar la venta.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200 [&>svg]:text-amber-600">
                        <IconPackage className="h-4 w-4" />
                        <AlertTitle>Atención</AlertTitle>
                        <AlertDescription>
                            {stockIssues.length === 1
                                ? `1 producto con stock insuficiente (faltan ${totalShortage} unidades)`
                                : `${stockIssues.length} productos con stock insuficiente (faltan ${totalShortage} unidades en total)`
                            }
                        </AlertDescription>
                    </Alert>

                    <div className="rounded-md border max-h-[200px] overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="sticky top-0 bg-background">Producto</TableHead>
                                    <TableHead className="sticky top-0 bg-background text-center w-[90px]">Solicitado</TableHead>
                                    <TableHead className="sticky top-0 bg-background text-center w-[90px]">Disponible</TableHead>
                                    <TableHead className="sticky top-0 bg-background text-center w-[80px]">Faltante</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockIssues.map((issue) => (
                                    <TableRow key={issue.medicine_id}>
                                        <TableCell className="font-medium text-sm">
                                            {issue.medicine_name}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {issue.requested}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={issue.available > 0 ? "secondary" : "destructive"}>
                                                {issue.available}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-red-600 font-medium">
                                            -{issue.shortage}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Si continúas, el stock disponible se venderá y quedará en cero para estos productos.
                        El sistema registrará la venta completa.
                    </p>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Procesando..." : "Confirmar Venta de Todos Modos"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default StockConfirmationDialog;
