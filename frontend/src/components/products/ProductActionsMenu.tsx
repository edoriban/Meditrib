import * as React from "react";
import { createPortal } from "react-dom";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { DeleteProductDialog } from "./DeleteProductDialog";

interface ProductActionsMenuProps {
    product: Product;
    onDelete: () => void;
    onEdit: () => void;
}

export function ProductActionsMenu({ product, onDelete, onEdit }: ProductActionsMenuProps) {
    const [showMenu, setShowMenu] = React.useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

    const menuRef = React.useRef<HTMLDivElement | null>(null);
    const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });

    const handleMenuToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        setShowMenu(!showMenu);

        if (!showMenu) {
            const buttonRect = event.currentTarget.getBoundingClientRect();
            const menuWidth = 192;
            const menuHeight = 96;

            let top = buttonRect.bottom + window.scrollY;
            let left = buttonRect.left + window.scrollX;

            if (left + menuWidth > window.innerWidth) {
                left = window.innerWidth - menuWidth - 16;
            }

            if (top + menuHeight > window.innerHeight) {
                top = buttonRect.top + window.scrollY - menuHeight;
            }

            setMenuPosition({ top, left });
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowMenu(false);
        }
    };

    React.useEffect(() => {
        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleMenuToggle}
            >
                <IconDotsVertical className="h-4 w-4" />
            </Button>

            {showMenu &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="absolute z-50 w-48 rounded-md shadow-lg bg-white"
                        style={{
                            top: menuPosition.top,
                            left: menuPosition.left,
                        }}
                    >
                        <div className="py-1">
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                                onClick={() => {
                                    onEdit();
                                    setShowMenu(false);
                                }}
                            >
                                <IconPencil className="mr-2 h-4 w-4" />
                                Editar
                            </button>
                            <button
                                className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
                                onClick={() => {
                                    setDeleteDialogOpen(true);
                                    setShowMenu(false);
                                }}
                            >
                                <IconTrash className="mr-2 h-4 w-4" />
                                Eliminar producto
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            <DeleteProductDialog
                product={product}
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirmDelete={onDelete}
            />
        </>
    );
}
