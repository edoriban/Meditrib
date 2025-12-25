import { forwardRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@/types/product";
import { ProductFormValues, productFormSchema } from "@/types/product";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SubmitHandler } from "react-hook-form";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { ProductEditForm } from "./ProductEditForm";
import { ProductEditActions } from "./ProductEditActions";
import { useProductMutations } from "@/hooks/useProductMutations";

interface ProductCellViewerProps {
    product: Product;
    onUpdate?: (productId: number, data: Partial<ProductFormValues>) => void;
    onDelete?: (productId: number) => void;
}

export const ProductCellViewer = forwardRef<HTMLButtonElement, ProductCellViewerProps>(
    ({ product, onUpdate, onDelete }, ref) => {
        const isMobile = useIsMobile();
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
        const { updateProduct, deleteProduct, isUpdating, isDeleting } = useProductMutations();

        const methods = useForm<ProductFormValues>({
            resolver: zodResolver(productFormSchema),
            defaultValues: {
                name: product.name,
                active_substance: product.active_substance,
                sale_price: product.sale_price,
                purchase_price: product.purchase_price,
                tags: product.tags ? product.tags.map(tag => Number(tag.id)) : [],
                inventory: {
                    quantity: product.inventory?.quantity || 0
                }
            }
        });


        const handleSubmit: SubmitHandler<ProductFormValues> = (data) => {
            const updateData = {
                ...data,
                tags: data.tags ? data.tags.map(tagId => Number(tagId)) : []
            };

            if (onUpdate) {
                onUpdate(product.id, updateData);
            } else {
                updateProduct(product.id, updateData);
            }
            toast.success(`Medicamento ${product.name} actualizado correctamente`);
        };

        const handleDeleteProduct = () => {
            if (onDelete) {
                onDelete(product.id);
            } else {
                deleteProduct(product.id);
            }
        };

        return (
            <Drawer direction={isMobile ? "bottom" : "right"}>
                <DrawerTrigger asChild>
                    <Button
                        variant="link"
                        className="p-0 text-left font-medium"
                        ref={ref}
                    >
                        {product.name}
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-w-md">
                    <DrawerHeader>
                        <DrawerTitle>Editar Medicamento</DrawerTitle>
                        <DrawerDescription>
                            Actualiza la información del medicamento {product.name}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
                                <ProductEditForm form={methods} />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Información de stock</label>
                                    <div className="rounded-md border p-3">
                                        <div className="text-sm space-y-2">
                                            <p>Cantidad actual: <span className="font-medium">{product.inventory?.quantity || 0}</span></p>
                                            {product.inventory?.quantity === 0 && (
                                                <p className="text-red-500">⚠️ Este producto está sin stock</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <DrawerFooter>
                                    <Button type="submit" className="w-full" disabled={isUpdating}>
                                        {isUpdating ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                    <ProductEditActions
                                        product={product}
                                        onDelete={onDelete ? () => onDelete(product.id) : undefined}
                                        isDeleteDialogOpen={isDeleteDialogOpen}
                                        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                                        handleDeleteProduct={handleDeleteProduct}
                                        isDeleting={isDeleting}
                                    />
                                </DrawerFooter>
                            </form>
                        </FormProvider>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
);

ProductCellViewer.displayName = "ProductCellViewer";
