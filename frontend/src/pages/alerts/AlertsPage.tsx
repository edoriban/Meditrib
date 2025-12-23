import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Alert } from "@/types/alert";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconCheck, IconRefresh, IconTrendingUp, IconTrendingDown, IconPackage, IconClock, IconX } from "@tabler/icons-react";
import { BASE_API_URL } from "@/config";
import { toast } from "sonner";

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'low':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'high':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'critical':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'low_stock':
            return <IconPackage className="size-4" />;
        case 'critical_stock':
            return <IconX className="size-4" />;
        case 'expiring':
            return <IconClock className="size-4" />;
        case 'expired':
            return <IconAlertTriangle className="size-4" />;
        default:
            return <IconAlertTriangle className="size-4" />;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'low_stock':
            return 'Stock Bajo';
        case 'critical_stock':
            return 'Stock Crítico';
        case 'expiring':
            return 'Por Expirar';
        case 'expired':
            return 'Expirado';
        default:
            return type;
    }
};

export default function AlertsPage() {
    const queryClient = useQueryClient();

    const { data: alerts, isLoading } = useQuery<Alert[]>({
        queryKey: ["alerts"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/alerts/`);
            return data;
        },
        refetchInterval: 30000,
    });

    const resolveMutation = useMutation({
        mutationFn: (alertId: number) => axios.post(`${BASE_API_URL}/alerts/${alertId}/resolve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alerta resuelta");
        },
        onError: () => {
            toast.error("Error al resolver la alerta");
        },
    });

    const checkAlertsMutation = useMutation({
        mutationFn: () => axios.post(`${BASE_API_URL}/alerts/check`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alerts"] });
            toast.success("Alertas verificadas");
        },
        onError: () => {
            toast.error("Error al verificar alertas");
        },
    });

    const activeAlerts = alerts?.filter(alert => alert.is_active) || [];
    const resolvedAlerts = alerts?.filter(alert => !alert.is_active) || [];

    const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
    const highCount = activeAlerts.filter(a => a.severity === 'high').length;
    const mediumCount = activeAlerts.filter(a => a.severity === 'medium').length;
    const lowCount = activeAlerts.filter(a => a.severity === 'low').length;

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Centro de Alertas</h1>
                        <p className="text-muted-foreground mt-2">
                            Monitorea el estado del inventario y fechas de caducidad.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => checkAlertsMutation.mutate()}
                            disabled={checkAlertsMutation.isPending}
                        >
                            <IconRefresh className={`mr-1 h-4 w-4 ${checkAlertsMutation.isPending ? 'animate-spin' : ''}`} />
                            {checkAlertsMutation.isPending ? "Verificando..." : "Verificar Alertas"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Alertas Activas</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {activeAlerts.length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className={activeAlerts.length > 0 ? "text-amber-600" : "text-green-600"}>
                                {activeAlerts.length > 0 ? <IconAlertTriangle className="size-4" /> : <IconCheck className="size-4" />}
                                {activeAlerts.length > 0 ? "Pendientes" : "OK"}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Requieren atención {activeAlerts.length > 0 ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                        </div>
                        <div className="text-muted-foreground">
                            {resolvedAlerts.length} resueltas
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Críticas</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${criticalCount > 0 ? 'text-red-600' : ''}`}>
                            {criticalCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-red-600">
                                <IconX className="size-4" />
                                Urgente
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Acción inmediata <IconAlertTriangle className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Prioridad máxima
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Altas</CardDescription>
                        <CardTitle className={`text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ${highCount > 0 ? 'text-orange-600' : ''}`}>
                            {highCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-orange-600">
                                <IconAlertTriangle className="size-4" />
                                Importante
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Atender pronto <IconTrendingUp className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            Alta prioridad
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Media/Baja</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {mediumCount + lowCount}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                <IconClock className="size-4" />
                                Pendientes
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Revisar cuando sea posible <IconClock className="size-4" />
                        </div>
                        <div className="text-muted-foreground">
                            {mediumCount} media, {lowCount} baja
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Active Alerts */}
            <Card>
                <CardHeader>
                    <CardTitle>Alertas Activas</CardTitle>
                    <CardDescription>Alertas que requieren atención</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Cargando alertas...</div>
                    ) : activeAlerts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto mb-4">
                                <IconCheck className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold mb-2 text-green-700">¡Todo en orden!</h3>
                            <p className="text-sm text-muted-foreground">
                                No hay alertas activas en este momento.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                                            {getTypeIcon(alert.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                                    {alert.severity.toUpperCase()}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {getTypeLabel(alert.type)}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(alert.created_at).toLocaleDateString('es-ES', { 
                                                        day: 'numeric', 
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <p className="font-medium">{alert.message}</p>
                                            {alert.product && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Medicamento: {alert.product.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => resolveMutation.mutate(alert.id)}
                                        disabled={resolveMutation.isPending}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <IconCheck className="h-4 w-4 mr-1" />
                                        Resolver
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resolved Alerts */}
            {resolvedAlerts.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Alertas Resueltas</CardTitle>
                        <CardDescription>Últimas {Math.min(resolvedAlerts.length, 10)} alertas resueltas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {resolvedAlerts.slice(0, 10).map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <IconCheck className="h-4 w-4 text-green-600" />
                                        <span className="text-sm">{alert.message}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {alert.resolved_at && new Date(alert.resolved_at).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
