import React from "react";
import { Button } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import DeleteMedicineDialog from "./DeleteMedicineDialog";
import { Medicine } from "@/types/medicine";

interface MedicineEditActionsProps {
    medicine: Medicine;
    onDelete?: () => void;
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    handleDeleteMedicine: () => void;
    isDeleting: boolean;
}

export const MedicineEditActions: React.FC<MedicineEditActionsProps> = ({
    medicine,
    onDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleDeleteMedicine,
    isDeleting
}) => (
    <div className="flex flex-col gap-2 w-full">
        {onDelete && (
            <>
                <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="w-full"
                    disabled={isDeleting}
                >
                    Eliminar medicamento
                </Button>
                <DeleteMedicineDialog
                    medicine={medicine}
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                    onConfirmDelete={handleDeleteMedicine}
                    isDeleting={isDeleting}
                />
            </>
        )}
        <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancelar</Button>
        </DrawerClose>
    </div>
);
