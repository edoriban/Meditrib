import * as React from "react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Skeleton } from "../ui/skeleton"
import { CreateSupplierDialog } from "@/components/suppliers/CreateSupplierDialog";
import { SupplierFilters } from "@/components/suppliers/SupplierFilters";
import { useSupplierMutations } from "@/hooks/useSupplierMutations";
import { SupplierActionsMenu } from "@/components/suppliers/SupplierActionsMenu";
import { SupplierCellViewer } from "@/components/suppliers/SupplierCellViewer";
import { Supplier } from "@/types/suppliers";

interface SuppliersTableProps {
    suppliers: Supplier[] | undefined | null;
    isLoading: boolean;
    error: any;
};

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, isLoading }) => {
    const data = suppliers;
    const [searchTerm, setSearchTerm] = useState("");
    const { deleteSupplier } = useSupplierMutations();
    const editRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});

    const filteredData = data?.filter(supplier => {
        const matchesSearchTerm =
            searchTerm === "" ||
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contact_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearchTerm;
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Proveedores</h2>
                <CreateSupplierDialog />
            </div>

            <SupplierFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                resultsCount={filteredData?.length || 0}
            />

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Información de contacto</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array(5).fill(0).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-[100px] ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredData?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    No hay proveedores que coincidan con los filtros
                                </TableCell>
                            </TableRow>
                        ) : filteredData?.map((supplier) => (
                            <TableRow key={supplier.id}>
                                <TableCell>
                                    <SupplierCellViewer
                                        supplier={supplier}
                                        ref={(el: HTMLButtonElement | null) => {
                                            editRefs.current[supplier.id] = el;
                                        }}
                                    />
                                </TableCell>
                                <TableCell className="max-w-xs truncate">{supplier.contact_info || "—"}</TableCell>
                                <TableCell>{supplier.email || "—"}</TableCell>
                                <TableCell>{supplier.phone || "—"}</TableCell>
                                <TableCell className="text-right">
                                    <SupplierActionsMenu
                                        supplier={supplier}
                                        onDelete={() => deleteSupplier(supplier.id)}
                                        onEdit={() => {
                                            if (editRefs.current[supplier.id]) {
                                                editRefs.current[supplier.id]?.click();
                                            }
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default SuppliersTable;