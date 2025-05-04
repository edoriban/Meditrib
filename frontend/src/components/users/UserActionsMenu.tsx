import * as React from "react";
import { User } from "@/types/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserActionsMenuProps {
    user: User;
    onDelete: () => void;
    onEdit: () => void;
}

export const UserActionsMenu = React.memo(function UserActionsMenu({
    user,
    onDelete,
    onEdit
}: UserActionsMenuProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [open, setOpen] = React.useState(false); // Controlar estado abierto/cerrado

    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-slate-100"
                        onClick={() => console.log("Botón de menú clickeado")}
                    >
                        <IconDotsVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="z-50" // Asegurar que tenga un z-index alto
                    forceMount // Forzar que se monte en el DOM
                >
                    <DropdownMenuItem
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Editar clickeado");
                            onEdit();
                            setOpen(false);
                        }}
                    >
                        <IconPencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Eliminar clickeado");
                            setDeleteDialogOpen(true);
                            setOpen(false);
                        }}
                    >
                        <IconTrash className="mr-2 h-4 w-4" />
                        Eliminar usuario
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteUserDialog
                user={user}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirmDelete={onDelete}
            />
        </>
    );
});