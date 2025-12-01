import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { ReportCreateValues, ReportUpdateValues } from "@/types/reports";
import { BASE_API_URL } from "@/config";

export function useReportMutations() {
    const queryClient = useQueryClient();

    // Crear reporte
    const createReport = useMutation({
        mutationFn: async (reportData: ReportCreateValues) => {
            const response = await axios.post(`${BASE_API_URL}/reports/`, reportData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Reporte creado correctamente");
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
        onError: (error) => {
            toast.error(`Error al crear reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    // Actualizar reporte
    const updateReport = useMutation({
        mutationFn: async ({ reportId, reportData }: { reportId: number, reportData: ReportUpdateValues }) => {
            const response = await axios.put(`${BASE_API_URL}/reports/${reportId}`, reportData);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Reporte actualizado correctamente");
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
        onError: (error) => {
            toast.error(`Error al actualizar reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            console.error("Error completo:", error);
        }
    });

    // Eliminar reporte
    const deleteReport = useMutation({
        mutationFn: async (reportId: number) => {
            const response = await axios.delete(`${BASE_API_URL}/reports/${reportId}`);
            return response.data;
        },
        onSuccess: () => {
            toast.success("Reporte eliminado correctamente");
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
        onError: (error) => {
            toast.error(`Error al eliminar reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    });

    return {
        createReport: (reportData: ReportCreateValues) => createReport.mutate(reportData),
        updateReport: (reportId: number, reportData: ReportUpdateValues) =>
            updateReport.mutate({ reportId, reportData }),
        deleteReport: (reportId: number) => deleteReport.mutate(reportId),
        isCreating: createReport.isPending,
        isUpdating: updateReport.isPending,
        isDeleting: deleteReport.isPending
    };
}