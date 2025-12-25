import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Alert } from "@/types/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package, Clock, XCircle, CheckCircle } from "lucide-react";
import { BASE_API_URL } from "@/config";

const getAlertIcon = (type: string) => {
    switch (type) {
        case 'low_stock':
            return <Package className="h-4 w-4" />;
        case 'critical_stock':
            return <XCircle className="h-4 w-4" />;
        case 'expiring':
            return <Clock className="h-4 w-4" />;
        case 'expired':
            return <AlertTriangle className="h-4 w-4" />;
        default:
            return <AlertTriangle className="h-4 w-4" />;
    }
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'low':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'critical':
            return 'bg-red-100 text-red-800 border-red-300';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

export function AlertsList() {
    const queryClient = useQueryClient();

    const { data: alerts, isLoading, error } = useQuery<Alert[]>({
        queryKey: ["alerts"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/alerts/`);
            return data;
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const resolveMutation = useMutation({
        mutationFn: (alertId: number) =>
            axios.post(`${BASE_API_URL}/alerts/${alertId}/resolve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
    });

    const checkAlertsMutation = useMutation({
        mutationFn: () => axios.post(`${BASE_API_URL}/alerts/check`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
        },
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">Cargando alertas...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-red-600">
                        Error al cargar alertas
                    </div>
                </CardContent>
            </Card>
        );
    }

    const activeAlerts = alerts?.filter(alert => alert.is_active) || [];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Alertas ({activeAlerts.length})
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => checkAlertsMutation.mutate()}
                        disabled={checkAlertsMutation.isPending}
                    >
                        {checkAlertsMutation.isPending ? "Verificando..." : "Verificar"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {activeAlerts.length === 0 ? (
                    <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-muted-foreground">No hay alertas activas</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-start justify-between p-3 border rounded-lg bg-muted/50"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                                {alert.severity.toUpperCase()}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(alert.created_at).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Producto: {alert.product.name}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => resolveMutation.mutate(alert.id)}
                                    disabled={resolveMutation.isPending}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}