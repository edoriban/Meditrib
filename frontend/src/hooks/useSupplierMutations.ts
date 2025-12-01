import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { SupplierCreateValues, SupplierUpdateValues } from "@/types/suppliers";
import { BASE_API_URL } from "@/config";

export function useSupplierMutations() {
    const queryClient = useQueryClient();

    // Crear proveedor
    const createSupplier = useMutation({
        mutationFn: async (supplierData: SupplierCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/suppliers/`, supplierData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Proveedor creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error) => {
            toast.error(`Error al crear proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar proveedor
    const updateSupplier = useMutation({
        mutationFn: async ({ supplierId, supplierData }: { supplierId: number, supplierData: SupplierUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/suppliers/${supplierId}`, supplierData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Proveedor actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error("Error completo:", error);
        }
    });

    // Eliminar proveedor
    const deleteSupplier = useMutation({
        mutationFn: async (supplierId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/suppliers/${supplierId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Proveedor eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar proveedor: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createSupplier: (supplierData: SupplierCreateValues) => createSupplier.mutate(supplierData),
        updateSupplier: (supplierId: number, supplierData: SupplierUpdateValues) =>
            updateSupplier.mutate({ supplierId, supplierData }),
        deleteSupplier: (supplierId: number) => deleteSupplier.mutate(supplierId),
        isCreating: createSupplier.isPending,
        isUpdating: updateSupplier.isPending,
        isDeleting: deleteSupplier.isPending
    };
}