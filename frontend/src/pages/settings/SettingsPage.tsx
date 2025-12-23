import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IconSettings, IconBuilding, IconBell, IconPrinter, IconDatabase, IconAlertTriangle, IconPhoto, IconTrash, IconLoader2 } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";

// Tipo para los datos de la empresa del backend
interface CompanyData {
    id: number;
    rfc: string;
    name: string; // Razón Social
    business_name?: string; // Nombre Comercial
    tax_regime: string;
    street: string;
    exterior_number: string;
    interior_number?: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    email: string;
    phone?: string;
    logo?: string;
}

export default function SettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // Configuración local (alertas, impresión, sistema - guardadas en localStorage)
    const [localSettings, setLocalSettings] = useState({
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

    // Datos de la empresa (guardados en el backend)
    const [companyData, setCompanyData] = useState({
        id: 0,
        rfc: "",
        name: "", // Razón Social
        business_name: "", // Nombre Comercial
        tax_regime: "601",
        street: "",
        exterior_number: "",
        interior_number: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "México",
        postal_code: "",
        email: "",
        phone: "",
        logo: "",
    });

    // Consulta para obtener las empresas
    const { data: companies, isLoading: isLoadingCompanies } = useQuery<CompanyData[]>({
        queryKey: ["companies"],
        queryFn: async () => {
            const { data } = await axios.get(`${BASE_API_URL}/companies/`);
            return data;
        }
    });

    // Cargar la empresa principal si existe
    useEffect(() => {
        if (companies && companies.length > 0) {
            const company = companies[0];
            setCompanyData({
                id: company.id,
                rfc: company.rfc || "",
                name: company.name || "",
                business_name: company.business_name || "",
                tax_regime: company.tax_regime || "601",
                street: company.street || "",
                exterior_number: company.exterior_number || "",
                interior_number: company.interior_number || "",
                neighborhood: company.neighborhood || "",
                city: company.city || "",
                state: company.state || "",
                country: company.country || "México",
                postal_code: company.postal_code || "",
                email: company.email || "",
                phone: company.phone || "",
                logo: company.logo || "",
            });
        }
    }, [companies]);

    // Cargar configuración local guardada
    useEffect(() => {
        const savedSettings = localStorage.getItem('meditrib_local_settings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                setLocalSettings(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Error al cargar configuración local:", e);
            }
        }
    }, []);

    // Mutación para crear empresa
    const createCompanyMutation = useMutation({
        mutationFn: async (data: Partial<CompanyData>) => {
            const response = await axios.post(`${BASE_API_URL}/companies/`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success("Datos de empresa guardados correctamente");
        },
        onError: (error: unknown) => {
            console.error("Error al crear empresa:", error);
            toast.error("Error al guardar los datos de la empresa");
        }
    });

    // Mutación para actualizar empresa
    const updateCompanyMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CompanyData> }) => {
            const response = await axios.put(`${BASE_API_URL}/companies/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["companies"] });
            toast.success("Datos de empresa actualizados correctamente");
        },
        onError: (error: unknown) => {
            console.error("Error al actualizar empresa:", error);
            toast.error("Error al actualizar los datos de la empresa");
        }
    });

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            toast.error("Por favor selecciona una imagen válida");
            return;
        }

        // Validar tamaño (máximo 1MB)
        if (file.size > 1024 * 1024) {
            toast.error("La imagen debe ser menor a 1MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setCompanyData({ ...companyData, logo: base64 });
            toast.success("Logo cargado correctamente");
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setCompanyData({ ...companyData, logo: "" });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.success("Logo eliminado");
    };

    const handleSave = async () => {
        // Guardar configuración local en localStorage
        localStorage.setItem('meditrib_local_settings', JSON.stringify(localSettings));

        // Validar datos de empresa antes de guardar
        if (!companyData.rfc || !companyData.name || !companyData.email) {
            toast.error("RFC, Razón Social y Email son campos requeridos");
            return;
        }

        // Guardar datos de empresa en el backend
        const companyPayload = {
            rfc: companyData.rfc,
            name: companyData.name,
            business_name: companyData.business_name || companyData.name, // Usar razón social si no hay nombre comercial
            tax_regime: companyData.tax_regime,
            street: companyData.street || "Sin especificar",
            exterior_number: companyData.exterior_number || "S/N",
            interior_number: companyData.interior_number || undefined,
            neighborhood: companyData.neighborhood || "Sin especificar",
            city: companyData.city || "Sin especificar",
            state: companyData.state || "Sin especificar",
            country: companyData.country || "México",
            postal_code: companyData.postal_code || "00000",
            email: companyData.email,
            phone: companyData.phone || undefined,
            logo: companyData.logo || undefined,
        };

        if (companyData.id > 0) {
            // Actualizar empresa existente
            updateCompanyMutation.mutate({ id: companyData.id, data: companyPayload });
        } else {
            // Crear nueva empresa
            createCompanyMutation.mutate(companyPayload);
        }
    };

    const isSaving = createCompanyMutation.isPending || updateCompanyMutation.isPending;

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
                    <Button onClick={handleSave} disabled={isSaving || isLoadingCompanies}>
                        {isSaving ? (
                            <IconLoader2 className="mr-1 h-4 w-4 animate-spin" />
                        ) : (
                            <IconSettings className="mr-1 h-4 w-4" />
                        )}
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Datos de la Empresa */}
                <Card className="md:col-span-2">
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
                        {/* Logo de la empresa */}
                        <div className="space-y-2">
                            <Label>Logo de la Empresa</Label>
                            <div className="flex items-center gap-4">
                                {companyData.logo ? (
                                    <div className="relative">
                                        <img
                                            src={companyData.logo}
                                            alt="Logo de la empresa"
                                            className="h-16 w-auto object-contain border rounded-md p-1"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6"
                                            onClick={handleRemoveLogo}
                                        >
                                            <IconTrash className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 border-2 border-dashed rounded-md flex items-center justify-center bg-muted">
                                        <IconPhoto className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        PNG o JPG, máximo 1MB. Se usará en PDFs y documentos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="business_name">Nombre Comercial</Label>
                                <Input
                                    id="business_name"
                                    value={companyData.business_name}
                                    onChange={(e) => setCompanyData({ ...companyData, business_name: e.target.value })}
                                    placeholder="Nombre comercial de la empresa"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nombre que aparecerá en tickets y documentos
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Razón Social <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={companyData.name}
                                    onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                                    placeholder="Razón social (nombre fiscal)"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nombre fiscal para facturas CFDI
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rfc">RFC <span className="text-red-500">*</span></Label>
                                <Input
                                    id="rfc"
                                    value={companyData.rfc}
                                    onChange={(e) => setCompanyData({ ...companyData, rfc: e.target.value.toUpperCase() })}
                                    placeholder="RFC de la empresa"
                                    maxLength={13}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tax_regime">Régimen Fiscal</Label>
                                <Input
                                    id="tax_regime"
                                    value={companyData.tax_regime}
                                    onChange={(e) => setCompanyData({ ...companyData, tax_regime: e.target.value })}
                                    placeholder="Código de régimen fiscal (ej: 601)"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="street">Calle</Label>
                            <Input
                                id="street"
                                value={companyData.street}
                                onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })}
                                placeholder="Nombre de la calle"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="exterior_number">Número Exterior</Label>
                                <Input
                                    id="exterior_number"
                                    value={companyData.exterior_number}
                                    onChange={(e) => setCompanyData({ ...companyData, exterior_number: e.target.value })}
                                    placeholder="# Ext."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interior_number">Número Interior</Label>
                                <Input
                                    id="interior_number"
                                    value={companyData.interior_number}
                                    onChange={(e) => setCompanyData({ ...companyData, interior_number: e.target.value })}
                                    placeholder="# Int. (opcional)"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neighborhood">Colonia</Label>
                                <Input
                                    id="neighborhood"
                                    value={companyData.neighborhood}
                                    onChange={(e) => setCompanyData({ ...companyData, neighborhood: e.target.value })}
                                    placeholder="Colonia"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Código Postal</Label>
                                <Input
                                    id="postal_code"
                                    value={companyData.postal_code}
                                    onChange={(e) => setCompanyData({ ...companyData, postal_code: e.target.value })}
                                    placeholder="C.P."
                                    maxLength={5}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    value={companyData.city}
                                    onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                                    placeholder="Ciudad"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    value={companyData.state}
                                    onChange={(e) => setCompanyData({ ...companyData, state: e.target.value })}
                                    placeholder="Estado"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">País</Label>
                                <Input
                                    id="country"
                                    value={companyData.country}
                                    onChange={(e) => setCompanyData({ ...companyData, country: e.target.value })}
                                    placeholder="País"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={companyData.phone}
                                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                                    placeholder="Teléfono"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={companyData.email}
                                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
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
                                    value={localSettings.lowStockThreshold}
                                    onChange={(e) => setLocalSettings({ ...localSettings, lowStockThreshold: parseInt(e.target.value) || 0 })}
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
                                    value={localSettings.criticalStockThreshold}
                                    onChange={(e) => setLocalSettings({ ...localSettings, criticalStockThreshold: parseInt(e.target.value) || 0 })}
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
                                    value={localSettings.expirationAlertDays}
                                    onChange={(e) => setLocalSettings({ ...localSettings, expirationAlertDays: parseInt(e.target.value) || 0 })}
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
                                checked={localSettings.enableEmailAlerts}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enableEmailAlerts: checked })}
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
                                checked={localSettings.printTicketOnSale}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, printTicketOnSale: checked })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="printerName">Nombre de Impresora</Label>
                            <Input
                                id="printerName"
                                value={localSettings.printerName}
                                onChange={(e) => setLocalSettings({ ...localSettings, printerName: e.target.value })}
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
                                checked={localSettings.autoBackup}
                                onCheckedChange={(checked) => setLocalSettings({ ...localSettings, autoBackup: checked })}
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
