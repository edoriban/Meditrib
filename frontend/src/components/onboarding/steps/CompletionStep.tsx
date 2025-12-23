import { Button } from "@/components/ui/button";
import { PartyPopper, ArrowRight, Package, ShoppingCart, BarChart3 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config";
import { useEffect } from "react";

interface CompletionStepProps {
    onFinish: () => void;
}

export function CompletionStep({ onFinish }: CompletionStepProps) {
    const completeOnboarding = useMutation({
        mutationFn: async () => {
            const response = await fetch(`${BASE_API_URL}/onboarding/complete`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Error al completar");
            return response.json();
        },
    });

    useEffect(() => {
        completeOnboarding.mutate();
    }, []);

    const quickLinks = [
        { icon: <Package className="h-5 w-5" />, label: "Agregar productos", path: "/products" },
        { icon: <ShoppingCart className="h-5 w-5" />, label: "Nueva venta", path: "/sales" },
        { icon: <BarChart3 className="h-5 w-5" />, label: "Ver reportes", path: "/reports" },
    ];

    return (
        <div className="space-y-6 text-center">
            <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-lg">
                    <PartyPopper className="h-10 w-10 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold">¡Todo listo!</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                    Tu sistema está configurado y listo para usar. Puedes empezar a vender de inmediato.
                </p>
            </div>

            <div className="grid gap-3 pt-4">
                <p className="text-sm font-medium text-muted-foreground">Accesos rápidos:</p>
                {quickLinks.map((link) => (
                    <Button
                        key={link.path}
                        variant="outline"
                        className="justify-start h-12"
                        onClick={() => {
                            onFinish();
                            window.location.href = link.path;
                        }}
                    >
                        {link.icon}
                        <span className="ml-3">{link.label}</span>
                        <ArrowRight className="ml-auto h-4 w-4" />
                    </Button>
                ))}
            </div>

            <Button size="lg" className="w-full mt-4" onClick={onFinish}>
                Ir al Dashboard
            </Button>
        </div>
    );
}
