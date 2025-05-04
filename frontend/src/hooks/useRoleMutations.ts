import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_API_URL } from '@/config';
import { toast } from 'sonner';

export function useRoleMutations() {
    const queryClient = useQueryClient();

    const createRole = useMutation({
        mutationFn: async (roleData: { name: string; description?: string }) => {
            const { data } = await axios.post(`${BASE_API_URL}/roles/`, roleData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol creado exitosamente');
        },
        onError: (error) => {
            console.error('Error al crear rol:', error);
            toast.error('No se pudo crear el rol');
        },
    }).mutateAsync;

    const updateRole = useMutation({
        mutationFn: async ({ roleId, roleData }: { roleId: number; roleData: any }) => {
            const { data } = await axios.patch(`${BASE_API_URL}/roles/${roleId}`, roleData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol actualizado exitosamente');
        },
        onError: (error) => {
            console.error('Error al actualizar rol:', error);
            toast.error('No se pudo actualizar el rol');
        },
    }).mutateAsync;

    const deleteRole = useMutation({
        mutationFn: async (roleId: number) => {
            await axios.delete(`${BASE_API_URL}/roles/${roleId}`);
            return roleId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success('Rol eliminado exitosamente');
        },
        onError: (error) => {
            console.error('Error al eliminar rol:', error);
            toast.error('No se pudo eliminar el rol');
        },
    }).mutateAsync;

    return {
        createRole,
        updateRole,
        deleteRole,
    };
}