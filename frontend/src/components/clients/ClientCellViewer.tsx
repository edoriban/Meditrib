import { forwardRef } from "react";
import { Client } from "@/types/clients";
import { Button } from "@/components/ui/button";

interface ClientCellViewerProps {
    client: Client;
    onUpdate?: (clientId: number, data: any) => void;
    onDelete?: (clientId: number) => void;
}

export const ClientCellViewer = forwardRef<HTMLButtonElement, ClientCellViewerProps>(
    ({ client }, ref) => {
        return (
            <Button
                variant="link"
                className="p-0 text-left font-medium"
                ref={ref}
            >
                {client.name}
            </Button>
        );
    }
);

ClientCellViewer.displayName = "ClientCellViewer";