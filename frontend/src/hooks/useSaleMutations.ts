import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { SaleCreateValues, SaleUpdateValues } from "@/types/sales";
import { BASE_API_URL } from "@/config";

export function useSaleMutations() {
    const queryClient = useQueryClient();

    // Crear venta
    const createSale = useMutation({
        mutationFn: async (saleData: SaleCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/sales/`, saleData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Venta creada correctamente");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["medicines"] }); // Actualizar inventario
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error(`Error al crear venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
    });

    // Crear venta con ajuste automático de stock (para stock insuficiente)
    const createSaleWithAutoAdjust = useMutation({
        mutationFn: async (saleData: SaleCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/sales/?auto_adjust_stock=true`, saleData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Venta creada correctamente (stock ajustado)");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error(`Error al crear venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
    });

    // Actualizar venta
    const updateSale = useMutation({
        mutationFn: async ({ saleId, saleData }: { saleId: number, saleData: SaleUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/sales/${saleId}`, saleData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Venta actualizada correctamente");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error(`Error al actualizar venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
    });

    // Eliminar venta
    const deleteSale = useMutation({
        mutationFn: async (saleId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/sales/${saleId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Venta eliminada correctamente");
            queryClient.invalidateQueries({ queryKey: ["sales"] });
            queryClient.invalidateQueries({ queryKey: ["medicines"] }); // El stock se revierte
        },
        onError: (error) => {
            if (axios.isAxiosError(error) && error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error(`Error al eliminar venta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
        }
    });

    return {
        createSale: (saleData: SaleCreateValues) => createSale.mutateAsync(saleData),
        createSaleWithAutoAdjust: (saleData: SaleCreateValues) => createSaleWithAutoAdjust.mutateAsync(saleData),
        updateSale: (saleId: number, saleData: SaleUpdateValues) =>
            updateSale.mutateAsync({ saleId, saleData }),
        deleteSale: (saleId: number) => deleteSale.mutateAsync(saleId),
        isCreating: createSale.isPending || createSaleWithAutoAdjust.isPending,
        isUpdating: updateSale.isPending,
        isDeleting: deleteSale.isPending
    };
}