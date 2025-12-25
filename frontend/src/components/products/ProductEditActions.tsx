import React from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import DeleteProductDialog from "./DeleteProductDialog";
import { Product } from "@/types/product";

interface ProductEditActionsProps {
    product: Product;
    onDelete?: () => void;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    handleDeleteProduct: () => void;
    isDeleting: boolean;
}

export const ProductEditActions: React.FC<ProductEditActionsProps> = ({
    product,
    onDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteProduct,
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
                    Eliminar producto
                </Button>
                <DeleteProductDialog
                    product={product}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirmDelete={handleDeleteProduct}
                    isDeleting={isDeleting}
                />
            </>
        )}
        <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancelar</Button>
        </DrawerClose>
    </div>
);
