import { useState, useEffect } from "react";
import { Supplier, SupplierUpdateValues } from "@/types/suppliers";
import { useSupplierMutations } from "@/hooks/useSupplierMutations";
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
import { IconLoader2 } from "@tabler/icons-react";

interface EditSupplierDialogProps {
    supplier: Supplier;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditSupplierDialog({ supplier, open, onOpenChange }: EditSupplierDialogProps) {
    const { updateSupplier, isUpdating } = useSupplierMutations();
    const [formData, setFormData] = useState<SupplierUpdateValues>({
        name: supplier.name,
        contact_info: supplier.contact_info || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
    });

    // Resetear form cuando cambie el proveedor
    useEffect(() => {
        setFormData({
            name: supplier.name,
            contact_info: supplier.contact_info || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
        });
    }, [supplier]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await updateSupplier(supplier.id, formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Error al actualizar proveedor:", error);
        }
    };

    const handleChange = (field: keyof SupplierUpdateValues, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Proveedor</DialogTitle>
                    <DialogDescription>
                        Modifica los datos del proveedor. Haz clic en guardar cuando termines.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre *</Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Nombre del proveedor"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="contact_info">Información de contacto</Label>
                            <Textarea
                                id="contact_info"
                                value={formData.contact_info || ""}
                                onChange={(e) => handleChange("contact_info", e.target.value)}
                                placeholder="Información de contacto"
                                rows={2}
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
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
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
                                placeholder="Dirección del proveedor"
                                rows={2}
                            />
                        </div>
                    </div>
                    <DialogFooter>
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

export default EditSupplierDialog;
