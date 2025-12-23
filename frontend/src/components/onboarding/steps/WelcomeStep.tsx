import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Building2, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config";

interface WelcomeStepProps {
    onComplete: () => void;
}

export function WelcomeStep({ onComplete }: WelcomeStepProps) {
    const [companyName, setCompanyName] = useState("");
    const [showFiscal, setShowFiscal] = useState(false);
    const [fiscalData, setFiscalData] = useState({
        rfc: "",
        street: "",
        exterior_number: "",
        neighborhood: "",
        city: "",
        state: "",
        postal_code: "",
    });

    const setupCompany = useMutation({
        mutationFn: async (data: { name: string; rfc?: string; street?: string; exterior_number?: string; neighborhood?: string; city?: string; state?: string; postal_code?: string }) => {
            const response = await fetch(`${BASE_API_URL}/onboarding/company`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error("Error al crear empresa");
            return response.json();
        },
        onSuccess: () => {
            onComplete();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setupCompany.mutate({
            name: companyName,
            ...fiscalData,
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">¡Bienvenido a VanPOS!</h2>
                <p className="text-muted-foreground">
                    Comencemos con los datos de tu negocio
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de tu empresa *</Label>
                    <Input
                        id="companyName"
                        placeholder="Mi Tienda"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                    />
                </div>

                <Collapsible open={showFiscal} onOpenChange={setShowFiscal}>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" type="button" className="w-full justify-between px-0 hover:bg-transparent">
                            <span className="text-sm text-muted-foreground">
                                Datos fiscales (opcional)
                            </span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFiscal ? "rotate-180" : ""}`} />
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-2">
                        <p className="text-xs text-muted-foreground">
                            Puedes llenar esto después para facturación electrónica
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rfc">RFC</Label>
                                <Input
                                    id="rfc"
                                    placeholder="XAXX010101000"
                                    value={fiscalData.rfc}
                                    onChange={(e) => setFiscalData({ ...fiscalData, rfc: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Código Postal</Label>
                                <Input
                                    id="postal_code"
                                    placeholder="06600"
                                    value={fiscalData.postal_code}
                                    onChange={(e) => setFiscalData({ ...fiscalData, postal_code: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="street">Calle</Label>
                            <Input
                                id="street"
                                placeholder="Av. Principal"
                                value={fiscalData.street}
                                onChange={(e) => setFiscalData({ ...fiscalData, street: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    placeholder="Ciudad de México"
                                    value={fiscalData.city}
                                    onChange={(e) => setFiscalData({ ...fiscalData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    placeholder="CDMX"
                                    value={fiscalData.state}
                                    onChange={(e) => setFiscalData({ ...fiscalData, state: e.target.value })}
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={!companyName || setupCompany.isPending}>
                        {setupCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Siguiente
                    </Button>
                </div>
            </form>
        </div>
    );
}
