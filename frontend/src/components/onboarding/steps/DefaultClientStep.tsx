import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Loader2, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config";

interface DefaultClientStepProps {
    onComplete: () => void;
}

export function DefaultClientStep({ onComplete }: DefaultClientStepProps) {
    const [clientName, setClientName] = useState("Público General");
    const [created, setCreated] = useState(false);

    const createClient = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BASE_API_URL}/onboarding/default-client`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            if (!response.ok) throw new Error("Error al crear cliente");
            return response.json();
        },
        onSuccess: () => {
            setCreated(true);
            setTimeout(() => onComplete(), 1000);
        },
    });

    const handleCreate = () => {
        createClient.mutate();
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Cliente por defecto</h2>
                <p className="text-muted-foreground">
                    Crearemos un cliente genérico para ventas de mostrador
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del cliente</Label>
                    <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        disabled={created}
                    />
                    <p className="text-xs text-muted-foreground">
                        Este cliente se usará para ventas sin factura
                    </p>
                </div>

                {created && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                        <Check className="h-5 w-5" />
                        <span>Cliente creado correctamente</span>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <Button onClick={handleCreate} disabled={createClient.isPending || created}>
                        {createClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {created ? "Creado ✓" : "Crear cliente"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
