import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClientCreateValues, clientFormSchema } from "@/types/clients";
import { TAX_REGIMES, CFDI_USES, MEXICAN_STATES } from "@/types/sat-catalogs";
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IconChevronDown, IconFileInvoice } from "@tabler/icons-react";

interface CreateClientDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
    const { createClient } = useClientMutations();
    const [showFiscalData, setShowFiscalData] = useState(false);

    const form = useForm<ClientCreateValues>({
        resolver: zodResolver(clientFormSchema),
        defaultValues: {
            name: "",
            contact: "",
            address: "",
            email: "",
            rfc: "",
            tax_regime: "",
            cfdi_use: "",
            fiscal_street: "",
            fiscal_exterior_number: "",
            fiscal_interior_number: "",
            fiscal_neighborhood: "",
            fiscal_city: "",
            fiscal_state: "",
            fiscal_postal_code: "",
            fiscal_country: "MEX",
        },
    });

    const onSubmit: SubmitHandler<ClientCreateValues> = async (data) => {
        await createClient(data);
        onOpenChange(false);
        form.reset();
        setShowFiscalData(false);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
            setShowFiscalData(false);
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Cliente</DialogTitle>
                    <DialogDescription>
                        Agrega un nuevo cliente al sistema. Los datos fiscales son opcionales pero necesarios para facturación.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Información básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Nombre / Razón Social *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nombre del cliente o empresa" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono/Contacto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="(555) 123-4567" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="cliente@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Dirección General</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Dirección de entrega o contacto" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        {/* Datos Fiscales (Expandible) */}
                        <div>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-between"
                                onClick={() => setShowFiscalData(!showFiscalData)}
                            >
                                <div className="flex items-center gap-2">
                                    <IconFileInvoice className="h-4 w-4" />
                                    Datos Fiscales (para facturación)
                                </div>
                                <IconChevronDown className={`h-4 w-4 transition-transform ${showFiscalData ? "rotate-180" : ""}`} />
                            </Button>

                            {showFiscalData && (
                                <div className="space-y-4 pt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="rfc"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>RFC</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="XXXX000000XXX"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs">
                                                        12 caracteres (moral) o 13 (física)
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="tax_regime"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Régimen Fiscal</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar régimen" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {TAX_REGIMES.map((regime) => (
                                                                <SelectItem key={regime.code} value={regime.code}>
                                                                    {regime.code} - {regime.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cfdi_use"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Uso del CFDI</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar uso" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {CFDI_USES.map((use) => (
                                                                <SelectItem key={use.code} value={use.code}>
                                                                    {use.code} - {use.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Dirección Fiscal */}
                                    <div className="pt-2">
                                        <h4 className="text-sm font-medium mb-3">Dirección Fiscal</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="fiscal_street"
                                                render={({ field }) => (
                                                    <FormItem className="md:col-span-2">
                                                        <FormLabel>Calle</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Av. Principal" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_exterior_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>No. Exterior</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="123" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_interior_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>No. Interior</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="A (opcional)" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_neighborhood"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Colonia</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Centro" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Ciudad/Municipio</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ciudad de México" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Estado</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Seleccionar estado" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {MEXICAN_STATES.map((state) => (
                                                                    <SelectItem key={state.code} value={state.code}>
                                                                        {state.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="fiscal_postal_code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Código Postal</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="06600"
                                                                maxLength={5}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Creando..." : "Crear Cliente"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export default CreateClientDialog;
