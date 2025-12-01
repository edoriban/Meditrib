import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { PurchaseOrderCreateValues, PurchaseOrderUpdateValues } from "@/types/purchase_orders";
import { BASE_API_URL } from "@/config";

export function usePurchaseOrderMutations() {
    const queryClient = useQueryClient();

    // Crear orden de compra
    const createPurchaseOrder = useMutation({
        mutationFn: async (purchaseOrderData: PurchaseOrderCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/purchase_order/`, purchaseOrderData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Orden de compra creada correctamente");
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
        },
        onError: (error) => {
            toast.error(`Error al crear orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar orden de compra
    const updatePurchaseOrder = useMutation({
        mutationFn: async ({ purchaseOrderId, purchaseOrderData }: { purchaseOrderId: number, purchaseOrderData: PurchaseOrderUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/purchase_order/${purchaseOrderId}`, purchaseOrderData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Orden de compra actualizada correctamente");
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error("Error completo:", error);
        }
    });

    // Eliminar orden de compra
    const deletePurchaseOrder = useMutation({
        mutationFn: async (purchaseOrderId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/purchase_order/${purchaseOrderId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Orden de compra eliminada correctamente");
            queryClient.invalidateQueries({ queryKey: ["purchase_orders"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar orden de compra: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createPurchaseOrder: (purchaseOrderData: PurchaseOrderCreateValues) => createPurchaseOrder.mutate(purchaseOrderData),
        updatePurchaseOrder: (purchaseOrderId: number, purchaseOrderData: PurchaseOrderUpdateValues) =>
            updatePurchaseOrder.mutate({ purchaseOrderId, purchaseOrderData }),
        deletePurchaseOrder: (purchaseOrderId: number) => deletePurchaseOrder.mutate(purchaseOrderId),
        isCreating: createPurchaseOrder.isPending,
        isUpdating: updatePurchaseOrder.isPending,
        isDeleting: deletePurchaseOrder.isPending
    };
}