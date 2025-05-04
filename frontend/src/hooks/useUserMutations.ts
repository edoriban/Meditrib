import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { UserFormValues } from "@/types/forms";
import { BASE_API_URL } from "@/config";

export function useUserMutations() {
    const queryClient = useQueryClient();

    // Actualizar usuario
    const updateUser = useMutation({
        mutationFn: async ({ userId, userData }: { userId: number, userData: Partial<UserFormValues> }) => {
            const response = await axios.put(`${BASE_API_URL}/users/${userId}`, userData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Usuario actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Eliminar usuario
    const deleteUser = useMutation({
        mutationFn: async (userId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/users/${userId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Usuario eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Crear usuario
    const createUser = useMutation({
        mutationFn: async (userData: UserFormValues) => {
            const response = await axios.post(`${BASE_API_URL}/users/`, userData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Usuario creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (error) => {
            toast.error(`Error al crear usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        updateUser: (userId: number, userData: Partial<UserFormValues>) =>
            updateUser.mutate({ userId, userData }),
        deleteUser: (userId: number) => deleteUser.mutate(userId),
        createUser: (userData: UserFormValues) => createUser.mutate(userData),
    };
}