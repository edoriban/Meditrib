import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { MedicineCreateValues, MedicineUpdateValues } from "@/types/medicine";
import { BASE_API_URL } from "@/config";

export function useMedicineMutations() {
    const queryClient = useQueryClient();

    // Crear medicamento
    const createMedicine = useMutation({
        mutationFn: async (medicineData: MedicineCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/medicines/`, medicineData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Medicamento creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: (error) => {
            toast.error(`Error al crear medicamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar medicamento
    const updateMedicine = useMutation({
        mutationFn: async ({ medicineId, medicineData }: { medicineId: number, medicineData: MedicineUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/medicines/${medicineId}`, medicineData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Medicamento actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar medicamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Eliminar medicamento
    const deleteMedicine = useMutation({
        mutationFn: async (medicineId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/medicines/${medicineId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Medicamento eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar medicamento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createMedicine: (medicineData: MedicineCreateValues) => createMedicine.mutate(medicineData),
        updateMedicine: (medicineId: number, medicineData: MedicineUpdateValues) =>
            updateMedicine.mutate({ medicineId, medicineData }),
        deleteMedicine: (medicineId: number) => deleteMedicine.mutate(medicineId),
        isCreating: createMedicine.isPending,
        isUpdating: updateMedicine.isPending,
        isDeleting: deleteMedicine.isPending
    };
}
