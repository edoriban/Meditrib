import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReportCreateValues, reportFormSchema } from "@/types/reports";
import { useReportMutations } from "@/hooks/useReportMutations";
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
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText } from "lucide-react";

interface GenerateReportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GenerateReportDialog({ open, onOpenChange }: GenerateReportDialogProps) {
    const { createReport } = useReportMutations();

    const form = useForm<ReportCreateValues>({
        resolver: zodResolver(reportFormSchema),
        defaultValues: {
            report_type: "",
            date: new Date().toISOString(),
            data: "{}",
            generated_by: 1, // Default user
        },
    });

    const onSubmit: SubmitHandler<ReportCreateValues> = async (data) => {
        await createReport(data);
        onOpenChange(false);
        form.reset();
    };

    const reportTypes = [
        { value: "sales", label: "Reporte de Ventas" },
        { value: "inventory", label: "Reporte de Inventario" },
        { value: "clients", label: "Reporte de Clientes" },
        { value: "suppliers", label: "Reporte de Proveedores" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generar Reporte</DialogTitle>
                    <DialogDescription>
                        Selecciona el tipo de reporte que deseas generar.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="report_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Reporte *</FormLabel>
                                    <Select onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar tipo de reporte" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {reportTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Generando..." : "Generar Reporte"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}