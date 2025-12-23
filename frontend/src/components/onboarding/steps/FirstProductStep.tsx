import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Loader2, Lightbulb } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config";

interface FirstProductStepProps {
    onComplete: () => void;
}

export function FirstProductStep({ onComplete }: FirstProductStepProps) {
    const [product, setProduct] = useState({
        name: "",
        sale_price: "",
        barcode: "",
    });

    const createProduct = useMutation({
        mutationFn: async (data: { name: string; sale_price: number; barcode?: string }) => {
            const response = await fetch(`${BASE_API_URL}/products/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    inventory: { quantity: 0 },
                }),
            });
            if (!response.ok) throw new Error("Error al crear producto");
            return response.json();
        },
        onSuccess: () => {
            onComplete();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createProduct.mutate({
            name: product.name,
            sale_price: parseFloat(product.sale_price) || 0,
            barcode: product.barcode || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Crea tu primer producto</h2>
                <p className="text-muted-foreground">
                    Solo necesitas nombre y precio para empezar
                </p>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
                <Lightbulb className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                <p className="text-muted-foreground">
                    Después podrás importar productos desde Excel o agregarlos con el escáner de código de barras.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="productName">Nombre del producto *</Label>
                    <Input
                        id="productName"
                        placeholder="Ej: Coca-Cola 600ml"
                        value={product.name}
                        onChange={(e) => setProduct({ ...product, name: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="salePrice">Precio de venta *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                id="salePrice"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="pl-7"
                                value={product.sale_price}
                                onChange={(e) => setProduct({ ...product, sale_price: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="barcode">Código de barras</Label>
                        <Input
                            id="barcode"
                            placeholder="Opcional"
                            value={product.barcode}
                            onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={!product.name || !product.sale_price || createProduct.isPending}>
                        {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Siguiente
                    </Button>
                </div>
            </form>
        </div>
    );
}
