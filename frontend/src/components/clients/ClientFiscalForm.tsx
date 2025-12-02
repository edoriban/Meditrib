import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Client } from "@/types/clients";
import { TAX_REGIMES, CFDI_USES, MEXICAN_STATES } from "@/types/sat-catalogs";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";

// Regex para validar RFC mexicano
const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
const postalCodeRegex = /^\d{5}$/;

// Schema de validación para datos fiscales
const fiscalFormSchema = z.object({
    rfc: z.string()
        .min(12, "RFC debe tener al menos 12 caracteres")
        .max(13, "RFC no puede tener más de 13 caracteres")
        .regex(rfcRegex, "Formato de RFC inválido"),
    tax_regime: z.string().min(1, "Régimen fiscal requerido"),
    cfdi_use: z.string().min(1, "Uso de CFDI requerido"),
    fiscal_street: z.string().min(1, "Calle fiscal requerida"),
    fiscal_exterior_number: z.string().optional(),
    fiscal_interior_number: z.string().optional(),
    fiscal_neighborhood: z.string().optional(),
    fiscal_city: z.string().optional(),
    fiscal_state: z.string().optional(),
    fiscal_postal_code: z.string()
        .min(5, "Código postal requerido")
        .max(5, "Código postal debe ser de 5 dígitos")
        .regex(postalCodeRegex, "Código postal debe ser de 5 dígitos"),
    fiscal_country: z.string(),
});

export type FiscalFormValues = z.infer<typeof fiscalFormSchema>;

interface ClientFiscalFormProps {
    client?: Client;
    onSubmit: (data: FiscalFormValues) => void;
    showValidationStatus?: boolean;
}

export function ClientFiscalForm({
    client,
    onSubmit,
    showValidationStatus = true
}: ClientFiscalFormProps) {
    const form = useForm<FiscalFormValues>({
        resolver: zodResolver(fiscalFormSchema),
        defaultValues: {
            rfc: client?.rfc?.toUpperCase() || "",
            tax_regime: client?.tax_regime || "",
            cfdi_use: client?.cfdi_use || "",
            fiscal_street: client?.fiscal_street || "",
            fiscal_exterior_number: client?.fiscal_exterior_number || "",
            fiscal_interior_number: client?.fiscal_interior_number || "",
            fiscal_neighborhood: client?.fiscal_neighborhood || "",
            fiscal_city: client?.fiscal_city || "",
            fiscal_state: client?.fiscal_state || "",
            fiscal_postal_code: client?.fiscal_postal_code || "",
            fiscal_country: client?.fiscal_country || "México",
        },
    });

    const handleSubmit = (data: FiscalFormValues) => {
        // Convertir RFC a mayúsculas
        const submittedData = { ...data, rfc: data.rfc.toUpperCase() };
        onSubmit(submittedData);
    };

    // Verificar si el formulario es válido para mostrar status
    const isValid = form.formState.isValid;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {showValidationStatus && (
                    <Alert variant={isValid ? "default" : "destructive"} className="mb-4">
                        {isValid ? (
                            <>
                                <IconCheck className="h-4 w-4" />
                                <AlertDescription>
                                    Datos fiscales completos. El cliente puede facturar.
                                </AlertDescription>
                            </>
                        ) : (
                            <>
                                <IconAlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Complete todos los campos requeridos para poder facturar.
                                </AlertDescription>
                            </>
                        )}
                    </Alert>
                )}

                {/* RFC */}
                <FormField
                    control={form.control}
                    name="rfc"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>RFC *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="XAXX010101000"
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                    maxLength={13}
                                />
                            </FormControl>
                            <FormDescription>
                                Persona física: 13 caracteres, Persona moral: 12 caracteres
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Régimen Fiscal y Uso CFDI */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="tax_regime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Régimen Fiscal *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar régimen" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[300px]">
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
                            <FormItem>
                                <FormLabel>Uso de CFDI *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar uso" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[300px]">
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
                <div className="space-y-4 border-t pt-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Dirección Fiscal</h4>

                    {/* Calle y números */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                            <FormField
                                control={form.control}
                                name="fiscal_street"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Calle *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Av. Reforma" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
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
                                        <Input placeholder="A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Colonia y CP */}
                    <div className="grid grid-cols-2 gap-4">
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
                            name="fiscal_postal_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código Postal *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="06600"
                                            {...field}
                                            maxLength={5}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Ciudad, Estado, País */}
                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="fiscal_city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ciudad</FormLabel>
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
                                                <SelectValue placeholder="Seleccionar" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px]">
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
                            name="fiscal_country"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>País</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* El botón de submit se maneja externamente */}
                <input type="submit" className="hidden" />
            </form>
        </Form>
    );
}

export default ClientFiscalForm;
