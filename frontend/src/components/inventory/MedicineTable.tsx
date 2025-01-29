import { useQuery } from "@tanstack/react-query"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import axios from "axios"
import type { Medicine } from "../../types/medicine"

export function MedicineTable() {
    const { data, isLoading, error } = useQuery<Medicine[]>({
        queryKey: ["medicines"],
        queryFn: async () => {
            const { data } = await axios.get("api/medicines")
            return data
        }
    })

    if (error) {
        return <div className="text-red-500">Error al cargar los datos</div>
    }

    return (
        <div className="rounded-md border bg-card text-card-foreground">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                        <TableHead>Medicine</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <TableRow key={i} className="hover:bg-muted/50">
                                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-full" /></TableCell>
                            </TableRow>
                        ))
                    ) : data?.map((medicine) => (
                        <TableRow key={medicine.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>${medicine.sale_price}</TableCell>
                            <TableCell>{medicine.inventory?.quantity || 0}</TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}