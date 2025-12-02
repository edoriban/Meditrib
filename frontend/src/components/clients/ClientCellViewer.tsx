import { forwardRef, useState, useImperativeHandle, useRef } from "react";
import { Client } from "@/types/clients";
import { Button } from "@/components/ui/button";
import { EditClientDialog } from "./EditClientDialog";

interface ClientCellViewerProps {
    client: Client;
    onUpdate?: (clientId: number, data: any) => void;
    onDelete?: (clientId: number) => void;
}

export const ClientCellViewer = forwardRef<HTMLButtonElement, ClientCellViewerProps>(
    ({ client }, ref) => {
        const [editDialogOpen, setEditDialogOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);

        // Exponer el método click al ref externo
        useImperativeHandle(ref, () => ({
            ...buttonRef.current!,
            click: () => setEditDialogOpen(true),
        }));

        return (
            <>
                <Button
                    variant="link"
                    className="p-0 text-left font-medium"
                    ref={buttonRef}
                    onClick={() => setEditDialogOpen(true)}
                >
                    {client.name}
                </Button>

                <EditClientDialog
                    client={client}
                    open={editDialogOpen}
                    onOpenChange={setEditDialogOpen}
                />
            </>
        );
    }
);

ClientCellViewer.displayName = "ClientCellViewer";