import { useQuery } from "@tanstack/react-query"
import { Button } from "../../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Skeleton } from "../../components/ui/skeleton"
import axios from "axios"
import { Edit, Plus, Trash2 } from "lucide-react"

// Definición de tipos basada en los esquemas del backend
export interface Inventory {
    medicine_id: number;
    quantity: number;
    batch?: string;
    expiry_date?: string;
}

export interface Medicine {
    id: number;
    name: string;
    description?: string;
    sale_price: number;
    purchase_price: number;
    supplier_id?: number;
    inventory?: Inventory;
}

export function MedicineTable() {
    const { data, isLoading, error } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            try {
                // Usar la ruta API correcta con el prefijo /api/v1
                const { data } = await axios.get("/api/v1/medicines/")
                return data
            } catch (error) {
                console.error("Error fetching medicines:", error)
                throw error
            }
        }
    })

    if (error) {
        return <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">Error al cargar los datos: {(error as Error).message}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Medicamentos</h2>
                <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Agregar medicamento</span>
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Precio de venta</TableHead>
                            <TableHead>Precio de compra</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No hay medicamentos registrados
                                </TableCell>
                            </TableRow>
                        ) : data?.map((medicine) => (
                            <TableRow key={medicine.id}>
                                <TableCell className="font-medium">{medicine.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{medicine.description || "—"}</TableCell>
                                <TableCell>${medicine.sale_price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {typeof medicine.purchase_price === 'number'
                                        ? `$${medicine.purchase_price.toFixed(2)}`
                                        : "N/A"}
                                </TableCell>
                                <TableCell className="font-mono">
                                    {medicine.inventory?.quantity || 0}
                                    {medicine.inventory?.quantity === 0 && (
                                        <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                                            Sin stock
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" title="Editar">
                                            <Edit size={16} />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                        <Button variant="ghost" size="icon" title="Eliminar" className="text-destructive hover:text-destructive">
                                            <Trash2 size={16} />
                                            <span className="sr-only">Eliminar</span>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}