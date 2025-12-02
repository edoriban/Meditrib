import { useState, useEffect } from "react";
import { Client, ClientUpdateValues } from "@/types/clients";
import { useClientMutations } from "@/hooks/useClientMutations";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IconLoader2 } from "@tabler/icons-react";
import { TAX_REGIMES, CFDI_USES } from "@/types/sat-catalogs";

interface EditClientDialogProps {
    client: Client;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditClientDialog({ client, open, onOpenChange }: EditClientDialogProps) {
    const { updateClient, isUpdating } = useClientMutations();
    const [formData, setFormData] = useState<ClientUpdateValues>({
        name: client.name,
        contact: client.contact || "",
        email: client.email || "",
        address: client.address || "",
        rfc: client.rfc || "",
        tax_regime: client.tax_regime || "",
        cfdi_use: client.cfdi_use || "",
        fiscal_street: client.fiscal_street || "",
        fiscal_exterior_number: client.fiscal_exterior_number || "",
        fiscal_interior_number: client.fiscal_interior_number || "",
        fiscal_neighborhood: client.fiscal_neighborhood || "",
        fiscal_city: client.fiscal_city || "",
        fiscal_state: client.fiscal_state || "",
        fiscal_postal_code: client.fiscal_postal_code || "",
    });

    // Resetear form cuando cambie el cliente
    useEffect(() => {
        setFormData({
            name: client.name,
            contact: client.contact || "",
            email: client.email || "",
            address: client.address || "",
            rfc: client.rfc || "",
            tax_regime: client.tax_regime || "",
            cfdi_use: client.cfdi_use || "",
            fiscal_street: client.fiscal_street || "",
            fiscal_exterior_number: client.fiscal_exterior_number || "",
            fiscal_interior_number: client.fiscal_interior_number || "",
            fiscal_neighborhood: client.fiscal_neighborhood || "",
            fiscal_city: client.fiscal_city || "",
            fiscal_state: client.fiscal_state || "",
            fiscal_postal_code: client.fiscal_postal_code || "",
        });
    }, [client]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await updateClient(client.id, formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
        }
    };

    const handleChange = (field: keyof ClientUpdateValues, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del cliente. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">Datos Generales</TabsTrigger>
                            <TabsTrigger value="fiscal">Datos Fiscales</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 mt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    placeholder="Nombre del cliente"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email || ""}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="email@ejemplo.com"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="contact">Teléfono de contacto</Label>
                                    <Input
                                        id="contact"
                                        value={formData.contact || ""}
                                        onChange={(e) => handleChange("contact", e.target.value)}
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address || ""}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    placeholder="Dirección del cliente"
                                    rows={2}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="fiscal" className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="rfc">RFC</Label>
                                    <Input
                                        id="rfc"
                                        value={formData.rfc || ""}
                                        onChange={(e) => handleChange("rfc", e.target.value.toUpperCase())}
                                        placeholder="XAXX010101000"
                                        maxLength={13}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fiscal_postal_code">Código Postal Fiscal</Label>
                                    <Input
                                        id="fiscal_postal_code"
                                        value={formData.fiscal_postal_code || ""}
                                        onChange={(e) => handleChange("fiscal_postal_code", e.target.value)}
                                        placeholder="06600"
                                        maxLength={5}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tax_regime">Régimen Fiscal</Label>
                                <Select
                                    value={formData.tax_regime || ""}
                                    onValueChange={(value) => handleChange("tax_regime", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona régimen fiscal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TAX_REGIMES.map((regime) => (
                                            <SelectItem key={regime.code} value={regime.code}>
                                                {regime.code} - {regime.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="cfdi_use">Uso de CFDI</Label>
                                <Select
                                    value={formData.cfdi_use || ""}
                                    onValueChange={(value) => handleChange("cfdi_use", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona uso de CFDI" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CFDI_USES.map((use) => (
                                            <SelectItem key={use.code} value={use.code}>
                                                {use.code} - {use.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Dirección Fiscal</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="col-span-2">
                                        <Input
                                            value={formData.fiscal_street || ""}
                                            onChange={(e) => handleChange("fiscal_street", e.target.value)}
                                            placeholder="Calle"
                                        />
                                    </div>
                                    <Input
                                        value={formData.fiscal_exterior_number || ""}
                                        onChange={(e) => handleChange("fiscal_exterior_number", e.target.value)}
                                        placeholder="No. Ext."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={formData.fiscal_interior_number || ""}
                                        onChange={(e) => handleChange("fiscal_interior_number", e.target.value)}
                                        placeholder="No. Int. (opcional)"
                                    />
                                    <Input
                                        value={formData.fiscal_neighborhood || ""}
                                        onChange={(e) => handleChange("fiscal_neighborhood", e.target.value)}
                                        placeholder="Colonia"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        value={formData.fiscal_city || ""}
                                        onChange={(e) => handleChange("fiscal_city", e.target.value)}
                                        placeholder="Ciudad"
                                    />
                                    <Input
                                        value={formData.fiscal_state || ""}
                                        onChange={(e) => handleChange("fiscal_state", e.target.value)}
                                        placeholder="Estado"
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isUpdating}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? (
                                <>
                                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar cambios"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditClientDialog;
