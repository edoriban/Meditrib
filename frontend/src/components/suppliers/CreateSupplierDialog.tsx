import * as React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSupplierMutations } from "@/hooks/useSupplierMutations";
import { SupplierCreateValues, supplierCreateSchema } from "@/types/suppliers";

export function CreateSupplierDialog() {
    const { createSupplier, isCreating } = useSupplierMutations();
    const [open, setOpen] = React.useState(false);

    const form = useForm<SupplierCreateValues>({
        resolver: zodResolver(supplierCreateSchema),
        defaultValues: {
            name: "",
            contact_info: "",
            email: "",
            phone: "",
        }
    });

    const onSubmit: SubmitHandler<SupplierCreateValues> = async (data) => {
        try {
            await createSupplier(data);
            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Error al crear proveedor:", error);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
        }
        setOpen(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    <span>Agregar proveedor</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Agregar nuevo proveedor</DialogTitle>
                    <DialogDescription>
                        Completa la información para registrar un nuevo proveedor en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del proveedor</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Farmacéutica XYZ"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contact_info"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Información de contacto</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Ej: Dirección, ciudad, etc."
                                            {...field}
                                            rows={3}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="proveedor@ejemplo.com"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="+52 55 1234 5678"
                                                {...field}
                                                value={field.value || ""}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline" type="button">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? "Creando..." : "Crear proveedor"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateSupplierDialog;