import * as React from "react";
import { User } from "@/types/user";
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
import { Button } from "@/components/ui/button";

interface DeleteUserDialogProps {
    user: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirmDelete: () => void;
}

export function DeleteUserDialog({
    user,
    open,
    onOpenChange,
    onConfirmDelete
}: DeleteUserDialogProps) {
    const [confirmEmail, setConfirmEmail] = React.useState("");
    const [error, setError] = React.useState("");

    // Resetear estado cuando el diálogo se cierra
    React.useEffect(() => {
        if (!open) {
            setConfirmEmail("");
            setError("");
        }
    }, [open]);

    const handleDeleteConfirm = () => {
        if (confirmEmail !== user.email) {
            setError("El email no coincide con el del usuario");
            return;
        }

        onConfirmDelete();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600">Eliminar usuario</DialogTitle>
                    <DialogDescription>
                        Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="mb-4">
                        Para confirmar, escribe el email del usuario: <strong>{user.email}</strong>
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-email">Email de confirmación</Label>
                        <Input
                            id="confirm-email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder="usuario@ejemplo.com"
                            className={error ? "border-red-500" : ""}
                        />
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteConfirm}
                    >
                        Eliminar usuario
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DeleteUserDialog;