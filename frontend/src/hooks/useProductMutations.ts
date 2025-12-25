import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { ProductCreateValues, ProductUpdateValues } from "@/types/product";
import { BASE_API_URL } from "@/config";

export function useProductMutations() {
    const queryClient = useQueryClient();

    // Crear producto
    const createProduct = useMutation({
        mutationFn: async (productData: ProductCreateValues) => {
            const payload = {
                ...productData,
                tags: productData.tags?.map(tag => typeof tag === 'string' ? parseInt(tag, 10) : tag) || []
            };

            const response = await axios.post(`${BASE_API_URL}/products/`, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Producto creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(`Error al crear producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar producto
    const updateProduct = useMutation({
        mutationFn: async ({ productId, productData }: { productId: number, productData: ProductUpdateValues }) => {
            // Asegurarnos de que tags sean números y no intentes convertir lo que ya es número
            const payload = {
                ...productData,
                tags: productData.tags?.map(tag =>
                    typeof tag === 'string' ? parseInt(tag, 10) : tag
                ) || []
            };

            const response = await axios.put(`${BASE_API_URL}/products/${productId}`, payload);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Producto actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error("Error completo:", error);
        }
    });

    // Eliminar producto
    const deleteProduct = useMutation({
        mutationFn: async (productId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/products/${productId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Producto eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["products"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createProduct: (productData: ProductCreateValues) => createProduct.mutate(productData),
        updateProduct: (productId: number, productData: ProductUpdateValues) =>
            updateProduct.mutate({ productId, productData }),
        deleteProduct: (productId: number) => deleteProduct.mutate(productId),
        isCreating: createProduct.isPending,
        isUpdating: updateProduct.isPending,
        isDeleting: deleteProduct.isPending
    };
}
