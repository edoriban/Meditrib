import { useState, useRef } from "react";
import { Client } from "@/types/clients";
import { useClientMutations } from "@/hooks/useClientMutations";
import { ClientFilters } from "./ClientFilters";
import { ClientCellViewer } from "./ClientCellViewer";
import { ClientActionsMenu } from "./ClientActionsMenu";
import { DeleteClientDialog } from "./DeleteClientDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ClientsTableProps {
    data: Client[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function ClientsTable({ data, searchTerm, onSearchChange }: ClientsTableProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const editRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});

    const { updateClient, deleteClient } = useClientMutations();

    const filteredData = data.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (client.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    const handleDelete = (client: Client) => {
        setClientToDelete(client);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (clientToDelete) {
            await deleteClient(clientToDelete.id);
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <ClientFilters
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Contacto</TableHead>
                            <TableHead>Dirección</TableHead>
                            <TableHead className="w-[70px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData?.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell>
                                    <ClientCellViewer
                                        client={client}
                                        ref={(el: HTMLButtonElement | null) => {
                                            editRefs.current[client.id] = el;
                                        }}
                                    />
                                </TableCell>
                                <TableCell>{client.email}</TableCell>
                                <TableCell>{client.contact || "-"}</TableCell>
                                <TableCell>{client.address || "-"}</TableCell>
                                <TableCell>
                                    <ClientActionsMenu
                                        client={client}
                                        onEdit={() => {
                                            editRefs.current[client.id]?.click();
                                        }}
                                        onDelete={() => handleDelete(client)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <DeleteClientDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                clientName={clientToDelete?.name || ""}
            />
        </div>
    );
}