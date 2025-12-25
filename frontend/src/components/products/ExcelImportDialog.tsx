import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import {
    ExcelImportPreviewItem,
    ExcelImportPreviewResponse,
    ExcelImportConfirmItem,
    ExcelImportConfirmResponse
} from "@/types/product";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    IconUpload,
    IconTrendingUp,
    IconTrendingDown,
    IconMinus,
    IconPlus,
    IconCheck,
    IconAlertTriangle,
    IconFileSpreadsheet
} from "@tabler/icons-react";

interface ExcelImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

type ImportStep = "upload" | "preview" | "result";

export function ExcelImportDialog({ open, onOpenChange }: ExcelImportDialogProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<ImportStep>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ExcelImportPreviewResponse | null>(null);
    const [editedItems, setEditedItems] = useState<ExcelImportConfirmItem[]>([]);
    const [importResult, setImportResult] = useState<ExcelImportConfirmResponse | null>(null);

    // Mutation para preview
    const previewMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);
            const response = await axios.post<ExcelImportPreviewResponse>(
                `${BASE_API_URL}/products/import-excel/preview`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            return response.data;
        },
        onSuccess: (data) => {
            setPreviewData(data);
            // Inicializar items editables con precios sugeridos
            const items: ExcelImportConfirmItem[] = data.items.map(item => ({
                barcode: item.barcode,
                name: item.name,
                active_substance: item.active_substance,
                laboratory: item.laboratory,
                purchase_price: item.purchase_price_new,
                sale_price: item.sale_price_suggested,
                iva_rate: item.iva_rate,
                inventory_to_add: item.inventory_to_add,
                exists: item.exists,
                product_id: item.product_id,
                sat_key: null
            }));
            setEditedItems(items);
            setStep("preview");
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Error al procesar el archivo";
            toast.error(message);
        }
    });

    // Mutation para confirmar
    const confirmMutation = useMutation({
        mutationFn: async (items: ExcelImportConfirmItem[]) => {
            const response = await axios.post<ExcelImportConfirmResponse>(
                `${BASE_API_URL}/products/import-excel/confirm`,
                items
            );
            return response.data;
        },
        onSuccess: (data) => {
            setImportResult(data);
            setStep("result");
            queryClient.invalidateQueries({ queryKey: ["products"] });
            toast.success(`Importación completada: ${data.created} creados, ${data.updated} actualizados`);
        },
        onError: (error: any) => {
            const message = error.response?.data?.detail || "Error al confirmar importación";
            toast.error(message);
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
                toast.error("Solo se permiten archivos Excel (.xlsx, .xls)");
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleUpload = () => {
        if (file) {
            previewMutation.mutate(file);
        }
    };

    const handlePriceChange = useCallback((index: number, newPrice: number) => {
        setEditedItems(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], sale_price: newPrice };
            return updated;
        });
    }, []);

    const handleConfirm = () => {
        confirmMutation.mutate(editedItems);
    };

    const handleClose = () => {
        setStep("upload");
        setFile(null);
        setPreviewData(null);
        setEditedItems([]);
        setImportResult(null);
        onOpenChange(false);
    };

    const getPriceChangeBadge = (item: ExcelImportPreviewItem) => {
        switch (item.price_change) {
            case "up":
                return (
                    <Badge variant="destructive" className="gap-1">
                        <IconTrendingUp className="h-3 w-3" />
                        Subió
                    </Badge>
                );
            case "down":
                return (
                    <Badge variant="default" className="gap-1 bg-green-600">
                        <IconTrendingDown className="h-3 w-3" />
                        Bajó
                    </Badge>
                );
            case "same":
                return (
                    <Badge variant="secondary" className="gap-1">
                        <IconMinus className="h-3 w-3" />
                        Igual
                    </Badge>
                );
            case "new":
                return (
                    <Badge variant="outline" className="gap-1">
                        <IconPlus className="h-3 w-3" />
                        Nuevo
                    </Badge>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconFileSpreadsheet className="h-5 w-5" />
                        Importar Productos desde Excel
                    </DialogTitle>
                    <DialogDescription>
                        {step === "upload" && "Selecciona un archivo Excel con la lista de productos."}
                        {step === "preview" && "Revisa y ajusta los precios antes de confirmar la importación."}
                        {step === "result" && "Resultado de la importación."}
                    </DialogDescription>
                </DialogHeader>

                {/* STEP 1: Upload */}
                {step === "upload" && (
                    <div className="space-y-4 py-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Formato Esperado</CardTitle>
                                <CardDescription>
                                    El archivo debe contener las siguientes columnas:
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><Badge variant="outline">CODIGO DE BARRAS</Badge> - Requerido</div>
                                    <div><Badge variant="outline">DESCRIPCION</Badge> - Requerido</div>
                                    <div><Badge variant="outline">DELTA</Badge> - Precio compra (Requerido)</div>
                                    <div><Badge variant="secondary">SUSTANCIA ACTIVA</Badge> - Opcional</div>
                                    <div><Badge variant="secondary">LABORATORIO</Badge> - Opcional</div>
                                    <div><Badge variant="secondary">IVA</Badge> - "IVA" o "s/IVA"</div>
                                    <div><Badge variant="secondary">INV</Badge> - Cantidad inventario</div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            <Label htmlFor="excel-file">Archivo Excel</Label>
                            <Input
                                id="excel-file"
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                            />
                            {file && (
                                <p className="text-sm text-muted-foreground">
                                    Archivo seleccionado: {file.name}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: Preview */}
                {step === "preview" && previewData && (
                    <div className="space-y-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-2xl font-bold">{previewData.total_items}</div>
                                    <p className="text-xs text-muted-foreground">Total productos</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-2xl font-bold text-green-600">{previewData.new_products}</div>
                                    <p className="text-xs text-muted-foreground">Nuevos</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-2xl font-bold text-blue-600">{previewData.existing_products}</div>
                                    <p className="text-xs text-muted-foreground">Existentes</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-4">
                                    <div className="text-2xl font-bold text-amber-600">{previewData.price_changes}</div>
                                    <p className="text-xs text-muted-foreground">Cambios precio</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Table */}
                        <ScrollArea className="h-[400px] rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-background">
                                    <TableRow>
                                        <TableHead className="w-[250px]">Producto</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">P. Compra Ant.</TableHead>
                                        <TableHead className="text-right">P. Compra Nuevo</TableHead>
                                        <TableHead className="text-right">P. Venta Sugerido</TableHead>
                                        <TableHead className="text-right w-[120px]">P. Venta Final</TableHead>
                                        <TableHead className="text-right">Inv.</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {previewData.items.map((item, index) => (
                                        <TableRow key={item.barcode} className={item.price_change === "up" ? "bg-red-50 dark:bg-red-950/20" : item.price_change === "down" ? "bg-green-50 dark:bg-green-950/20" : ""}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate max-w-[230px]" title={item.name}>
                                                        {item.name}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {item.barcode}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getPriceChangeBadge(item)}</TableCell>
                                            <TableCell className="text-right">
                                                {item.purchase_price_old ? formatCurrency(item.purchase_price_old) : "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(item.purchase_price_new)}
                                            </TableCell>
                                            <TableCell className="text-right text-muted-foreground">
                                                {formatCurrency(item.sale_price_suggested)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={editedItems[index]?.sale_price || 0}
                                                    onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                                                    className="w-[100px] h-8 text-right"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {item.inventory_to_add}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                )}

                {/* STEP 3: Result */}
                {step === "result" && importResult && (
                    <div className="space-y-4 py-4">
                        <div className="flex items-center justify-center py-8">
                            <div className="rounded-full bg-green-100 p-4">
                                <IconCheck className="h-12 w-12 text-green-600" />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-semibold">Importación Completada</h3>
                            <div className="flex justify-center gap-8">
                                <div>
                                    <span className="text-3xl font-bold text-green-600">{importResult.created}</span>
                                    <p className="text-sm text-muted-foreground">Creados</p>
                                </div>
                                <div>
                                    <span className="text-3xl font-bold text-blue-600">{importResult.updated}</span>
                                    <p className="text-sm text-muted-foreground">Actualizados</p>
                                </div>
                            </div>
                        </div>

                        {importResult.errors.length > 0 && (
                            <Card className="border-amber-200 bg-amber-50">
                                <CardHeader className="py-3">
                                    <CardTitle className="text-sm flex items-center gap-2 text-amber-700">
                                        <IconAlertTriangle className="h-4 w-4" />
                                        Errores ({importResult.errors.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="text-sm space-y-1">
                                        {importResult.errors.map((err, i) => (
                                            <li key={i} className="text-amber-700">
                                                {err.barcode}: {err.error}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {step === "upload" && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!file || previewMutation.isPending}
                            >
                                {previewMutation.isPending ? (
                                    "Procesando..."
                                ) : (
                                    <>
                                        <IconUpload className="h-4 w-4 mr-2" />
                                        Cargar y Previsualizar
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {step === "preview" && (
                        <>
                            <Button variant="outline" onClick={() => setStep("upload")}>
                                Volver
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={confirmMutation.isPending}
                            >
                                {confirmMutation.isPending ? (
                                    "Importando..."
                                ) : (
                                    <>
                                        <IconCheck className="h-4 w-4 mr-2" />
                                        Confirmar Importación
                                    </>
                                )}
                            </Button>
                        </>
                    )}

                    {step === "result" && (
                        <Button onClick={handleClose}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ExcelImportDialog;
