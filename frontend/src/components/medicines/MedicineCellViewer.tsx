import { forwardRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Medicine } from "@/types/medicine";
import { MedicineFormValues, medicineFormSchema } from "@/types/medicine";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { SubmitHandler } from "react-hook-form";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { MedicineEditForm } from "./MedicineEditForm";
import { MedicineEditActions } from "./MedicineEditActions";
import { useMedicineMutations } from "@/hooks/useMedicineMutations";

interface MedicineCellViewerProps {
    medicine: Medicine;
    onUpdate?: (medicineId: number, data: Partial<MedicineFormValues>) => void;
    onDelete?: (medicineId: number) => void;
}

export const MedicineCellViewer = forwardRef<HTMLButtonElement, MedicineCellViewerProps>(
    ({ medicine, onUpdate, onDelete }, ref) => {
        const isMobile = useIsMobile();
        const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
        const { updateMedicine, deleteMedicine, isUpdating, isDeleting } = useMedicineMutations();

        const methods = useForm<MedicineFormValues>({
            resolver: zodResolver(medicineFormSchema),
            defaultValues: {
                name: medicine.name,
                active_substance: medicine.active_substance,
                sale_price: medicine.sale_price,
                purchase_price: medicine.purchase_price,
                tags: medicine.tags ? medicine.tags.map(tag => Number(tag.id)) : [],
                inventory: {
                    quantity: medicine.inventory?.quantity || 0
                }
            }
        });


        const handleSubmit: SubmitHandler<MedicineFormValues> = (data) => {
            const updateData = {
                ...data,
                tags: data.tags ? data.tags.map(tagId => Number(tagId)) : []
            };

            if (onUpdate) {
                onUpdate(medicine.id, updateData);
            } else {
                updateMedicine(medicine.id, updateData);
            }
            toast.success(`Medicamento ${medicine.name} actualizado correctamente`);
        };

        const handleDeleteMedicine = () => {
            if (onDelete) {
                onDelete(medicine.id);
            } else {
                deleteMedicine(medicine.id);
            }
        };

        return (
            <Drawer direction={isMobile ? "bottom" : "right"}>
                <DrawerTrigger asChild>
                    <Button
                        variant="link"
                        className="p-0 text-left font-medium"
                        ref={ref}
                    >
                        {medicine.name}
                    </Button>
                </DrawerTrigger>
                <DrawerContent className="max-w-md">
                    <DrawerHeader>
                        <DrawerTitle>Editar Medicamento</DrawerTitle>
                        <DrawerDescription>
                            Actualiza la información del medicamento {medicine.name}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                        <FormProvider {...methods}>
                            <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-4">
                                <MedicineEditForm form={methods} />

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Información de stock</label>
                                    <div className="rounded-md border p-3">
                                        <div className="text-sm space-y-2">
                                            <p>Cantidad actual: <span className="font-medium">{medicine.inventory?.quantity || 0}</span></p>
                                            {medicine.inventory?.quantity === 0 && (
                                                <p className="text-red-500">⚠️ Este producto está sin stock</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <DrawerFooter>
                                    <Button type="submit" className="w-full" disabled={isUpdating}>
                                        {isUpdating ? "Guardando..." : "Guardar cambios"}
                                    </Button>
                                    <MedicineEditActions
                                        medicine={medicine}
                                        onDelete={onDelete ? () => onDelete(medicine.id) : undefined}
                                        isDeleteDialogOpen={isDeleteDialogOpen}
                                        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                                        handleDeleteMedicine={handleDeleteMedicine}
                                        isDeleting={isDeleting}
                                    />
                                </DrawerFooter>
                            </form>
                        </FormProvider>
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }
);

MedicineCellViewer.displayName = "MedicineCellViewer";
