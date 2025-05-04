import React from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import DeleteUserDialog from "./DeleteUserDialog";
import { User } from "@/types/user";

interface UserEditActionsProps {
    user: User;
    onDelete?: () => void;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    handleDeleteUser: () => void;
    isDeleting: boolean;
}

export const UserEditActions: React.FC<UserEditActionsProps> = ({
    user,
    onDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteUser,
    isDeleting
}) => (
    <div className="flex flex-col gap-2 w-full">
        {onDelete && (
            <>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full"
                    disabled={isDeleting}
                >
                    Eliminar usuario
                </Button>
                <DeleteUserDialog
                    user={user}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirmDelete={handleDeleteUser}
                />
            </>
        )}
        <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancelar</Button>
        </DrawerClose>
    </div>
);