import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IconSettings, IconBuilding, IconBell, IconPrinter, IconDatabase, IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        // Empresa
        companyName: "Mi Farmacia",
        companyRfc: "",
        companyAddress: "",
        companyPhone: "",
        companyEmail: "",
        // Alertas
        lowStockThreshold: 10,
        criticalStockThreshold: 5,
        expirationAlertDays: 30,
        enableEmailAlerts: false,
        // Impresión
        printTicketOnSale: true,
        printerName: "",
        // Sistema
        autoBackup: true,
        backupFrequency: "daily",
    });

    const handleSave = () => {
        // Aquí iría la lógica para guardar en el backend
        localStorage.setItem('meditrib_settings', JSON.stringify(settings));
        toast.success("Configuración guardada exitosamente");
    };

    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
                        <p className="text-muted-foreground mt-2">
                            Personaliza la configuración del sistema.
                        </p>
                    </div>
                    <Button onClick={handleSave}>
                        <IconSettings className="mr-1 h-4 w-4" />
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Datos de la Empresa */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <IconBuilding className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Datos de la Empresa</CardTitle>
                        </div>
                        <CardDescription>
                            Información fiscal para facturas y documentos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Razón Social</Label>
                            <Input 
                                id="companyName"
                                value={settings.companyName}
                                onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                                placeholder="Nombre de la empresa"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyRfc">RFC</Label>
                            <Input 
                                id="companyRfc"
                                value={settings.companyRfc}
                                onChange={(e) => setSettings({...settings, companyRfc: e.target.value})}
                                placeholder="RFC de la empresa"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyAddress">Dirección</Label>
                            <Input 
                                id="companyAddress"
                                value={settings.companyAddress}
                                onChange={(e) => setSettings({...settings, companyAddress: e.target.value})}
                                placeholder="Dirección fiscal"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyPhone">Teléfono</Label>
                                <Input 
                                    id="companyPhone"
                                    value={settings.companyPhone}
                                    onChange={(e) => setSettings({...settings, companyPhone: e.target.value})}
                                    placeholder="Teléfono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyEmail">Email</Label>
                                <Input 
                                    id="companyEmail"
                                    type="email"
                                    value={settings.companyEmail}
                                    onChange={(e) => setSettings({...settings, companyEmail: e.target.value})}
                                    placeholder="Email"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Configuración de Alertas */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <IconBell className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Alertas de Inventario</CardTitle>
                        </div>
                        <CardDescription>
                            Umbrales para generar alertas automáticas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="lowStock">Umbral de Stock Bajo</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    id="lowStock"
                                    type="number"
                                    value={settings.lowStockThreshold}
                                    onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value) || 0})}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">unidades</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Se genera alerta cuando el stock es menor a este valor
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="criticalStock">Umbral de Stock Crítico</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    id="criticalStock"
                                    type="number"
                                    value={settings.criticalStockThreshold}
                                    onChange={(e) => setSettings({...settings, criticalStockThreshold: parseInt(e.target.value) || 0})}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">unidades</span>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="expirationDays">Alerta de Caducidad</Label>
                            <div className="flex items-center gap-2">
                                <Input 
                                    id="expirationDays"
                                    type="number"
                                    value={settings.expirationAlertDays}
                                    onChange={(e) => setSettings({...settings, expirationAlertDays: parseInt(e.target.value) || 0})}
                                    className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">días antes</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Alertar cuando un producto esté por caducar
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Alertas por Email</Label>
                                <p className="text-xs text-muted-foreground">Enviar alertas al correo</p>
                            </div>
                            <Switch 
                                checked={settings.enableEmailAlerts}
                                onCheckedChange={(checked) => setSettings({...settings, enableEmailAlerts: checked})}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Configuración de Impresión */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <IconPrinter className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Impresión</CardTitle>
                        </div>
                        <CardDescription>
                            Configuración de tickets e impresora
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Imprimir ticket al vender</Label>
                                <p className="text-xs text-muted-foreground">Impresión automática de tickets</p>
                            </div>
                            <Switch 
                                checked={settings.printTicketOnSale}
                                onCheckedChange={(checked) => setSettings({...settings, printTicketOnSale: checked})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="printerName">Nombre de Impresora</Label>
                            <Input 
                                id="printerName"
                                value={settings.printerName}
                                onChange={(e) => setSettings({...settings, printerName: e.target.value})}
                                placeholder="Nombre de la impresora (opcional)"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Configuración del Sistema */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <IconDatabase className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Sistema</CardTitle>
                        </div>
                        <CardDescription>
                            Respaldos y mantenimiento
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Respaldo Automático</Label>
                                <p className="text-xs text-muted-foreground">Crear respaldos de la base de datos</p>
                            </div>
                            <Switch 
                                checked={settings.autoBackup}
                                onCheckedChange={(checked) => setSettings({...settings, autoBackup: checked})}
                            />
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                                <IconAlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                        Respaldos importantes
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Recomendamos hacer respaldos manuales regularmente desde la sección de Respaldos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
