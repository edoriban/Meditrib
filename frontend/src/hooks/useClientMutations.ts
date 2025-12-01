import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { ClientCreateValues, ClientUpdateValues } from "@/types/clients";
import { BASE_API_URL } from "@/config";

export function useClientMutations() {
    const queryClient = useQueryClient();

    // Crear cliente
    const createClient = useMutation({
        mutationFn: async (clientData: ClientCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/clients/`, clientData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Cliente creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (error) => {
            toast.error(`Error al crear cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar cliente
    const updateClient = useMutation({
        mutationFn: async ({ clientId, clientData }: { clientId: number, clientData: ClientUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/clients/${clientId}`, clientData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Cliente actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error("Error completo:", error);
        }
    });

    // Eliminar cliente
    const deleteClient = useMutation({
        mutationFn: async (clientId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/clients/${clientId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Cliente eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["clients"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar cliente: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createClient: (clientData: ClientCreateValues) => createClient.mutate(clientData),
        updateClient: (clientId: number, clientData: ClientUpdateValues) =>
            updateClient.mutate({ clientId, clientData }),
        deleteClient: (clientId: number) => deleteClient.mutate(clientId),
        isCreating: createClient.isPending,
        isUpdating: updateClient.isPending,
        isDeleting: deleteClient.isPending
    };
}