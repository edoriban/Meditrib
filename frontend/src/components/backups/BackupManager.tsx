import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload, Trash2, HardDrive, Database, Clock, AlertTriangle } from "lucide-react";
import { BASE_API_URL } from "@/config";

interface BackupInfo {
    total_backups: number;
    total_size_mb: number;
    by_type: {
        daily: number;
        weekly: number;
        monthly: number;
        manual: number;
    };
    oldest_backup?: string;
    newest_backup?: string;
}

interface BackupFile {
    filename: string;
    path: string;
    size_bytes: number;
    size_mb: number;
    created_at: number;
    modified_at: number;
}

export function BackupManager() {
    const queryClient = useQueryClient();

    const { data: backupInfo, isLoading: infoLoading } = useQuery<BackupInfo>({
        queryKey: ["backup-info"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/backups/info`);
            return data;
        },
    });

    const { data: backupFiles, isLoading: filesLoading } = useQuery<{ total_files: number; files: BackupFile[] }>({
        queryKey: ["backup-files"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/backups/files`);
            return data;
        },
    });

    const createBackupMutation = useMutation({
        mutationFn: (backupType: string) => axios.post(`${BASE_API_URL}/backups/create`, { backup_type: backupType }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backup-info"] });
            queryClient.invalidateQueries({ queryKey: ["backup-files"] });
        },
    });

    const cleanupMutation = useMutation({
        mutationFn: () => axios.post(`${BASE_API_URL}/backups/cleanup`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backup-info"] });
            queryClient.invalidateQueries({ queryKey: ["backup-files"] });
        },
    });

    const deleteBackupMutation = useMutation({
        mutationFn: (filename: string) => axios.delete(`${BASE_API_URL}/backups/files/${filename}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["backup-info"] });
            queryClient.invalidateQueries({ queryKey: ["backup-files"] });
        },
    });

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString('es-ES');
    };

    const getBackupTypeColor = (filename: string) => {
        if (filename.includes('_manual_')) return 'bg-blue-100 text-blue-800';
        if (filename.includes('_daily_')) return 'bg-green-100 text-green-800';
        if (filename.includes('_weekly_')) return 'bg-yellow-100 text-yellow-800';
        if (filename.includes('_monthly_')) return 'bg-purple-100 text-purple-800';
        return 'bg-gray-100 text-gray-800';
    };

    const getBackupTypeLabel = (filename: string) => {
        if (filename.includes('_manual_')) return 'Manual';
        if (filename.includes('_daily_')) return 'Diario';
        if (filename.includes('_weekly_')) return 'Semanal';
        if (filename.includes('_monthly_')) return 'Mensual';
        return 'Desconocido';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestión de Backups</h2>
                    <p className="text-muted-foreground">
                        Sistema de respaldo automático y manual de la base de datos
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => createBackupMutation.mutate("manual")}
                        disabled={createBackupMutation.isPending}
                    >
                        <Database className="h-4 w-4 mr-2" />
                        {createBackupMutation.isPending ? "Creando..." : "Crear Backup"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => cleanupMutation.mutate()}
                        disabled={cleanupMutation.isPending}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {cleanupMutation.isPending ? "Limpiando..." : "Limpiar Antiguos"}
                    </Button>
                </div>
            </div>

            {/* Backup Information */}
            {backupInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backupInfo.total_backups}</div>
                            <p className="text-xs text-muted-foreground">
                                {backupInfo.total_size_mb.toFixed(1)} MB total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backups Diarios</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backupInfo.by_type.daily}</div>
                            <p className="text-xs text-muted-foreground">
                                Últimos 30 días
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backups Semanales</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backupInfo.by_type.weekly}</div>
                            <p className="text-xs text-muted-foreground">
                                Últimas 12 semanas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backups Mensuales</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backupInfo.by_type.monthly}</div>
                            <p className="text-xs text-muted-foreground">
                                Últimos 24 meses
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Backup Files Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Archivos de Backup</CardTitle>
                </CardHeader>
                <CardContent>
                    {!backupFiles || backupFiles.files.length === 0 ? (
                        <div className="text-center py-8">
                            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-muted-foreground">No hay archivos de backup</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Crea tu primer backup para proteger tus datos
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre del Archivo</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Tamaño</TableHead>
                                    <TableHead>Fecha de Creación</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {backupFiles.files.map((file) => (
                                    <TableRow key={file.filename}>
                                        <TableCell className="font-mono text-sm">
                                            {file.filename}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getBackupTypeColor(file.filename)}>
                                                {getBackupTypeLabel(file.filename)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{file.size_mb.toFixed(2)} MB</TableCell>
                                        <TableCell>{formatDate(file.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Download functionality would need server-side implementation
                                                        alert("Descarga no implementada aún");
                                                    }}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`¿Eliminar el backup ${file.filename}?`)) {
                                                            deleteBackupMutation.mutate(file.filename);
                                                        }
                                                    }}
                                                    disabled={deleteBackupMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Information Alert */}
            <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div className="text-sm text-yellow-800">
                        <strong>Política de Retención:</strong> Los backups diarios se mantienen 30 días,
                        semanales 12 semanas, mensuales 24 meses. Los backups manuales se mantienen indefinidamente.
                        <br />
                        <strong>Backups Automáticos:</strong> Diarios a las 2 AM, semanales los domingos a las 3 AM,
                        mensuales el día 1 a las 4 AM.
                    </div>
                </div>
            </div>
        </div>
    );
}