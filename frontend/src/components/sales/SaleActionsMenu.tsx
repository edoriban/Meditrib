import { Sale } from "@/types/sales";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { IconFileTypePdf } from "@tabler/icons-react";
import { generateSalePDF } from "@/utils/salePdfGenerator";

interface SaleActionsMenuProps {
    sale: Sale;
    onEdit: () => void;
    onDelete: () => void;
}

export function SaleActionsMenu({ sale, onEdit, onDelete }: SaleActionsMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => generateSalePDF(sale)}>
                    <IconFileTypePdf className="mr-2 h-4 w-4" />
                    Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}