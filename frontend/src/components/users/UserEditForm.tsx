import React from "react";
import { FormInput } from "@/components/ui/form-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserFormValues, UserEditFormProps } from "@/types/user";

export const UserEditForm: React.FC<UserEditFormProps> = ({ form, roles }) => {
    const { control, formState: { errors }, setValue, watch } = form;
    const roleId = watch("role_id");

    return (
        <>
            <FormInput
                name="name"
                control={control}
                label="Nombre"
                placeholder="Nombre completo"
                errors={errors}
            />
            <FormInput
                name="email"
                control={control}
                label="Email"
                placeholder="correo@ejemplo.com"
                type="email"
                errors={errors}
            />
            <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                    Rol
                </label>
                <Select
                    value={roleId?.toString()}
                    onValueChange={(value) => {
                        setValue("role_id", parseInt(value), {
                            shouldValidate: true,
                            shouldDirty: true
                        });
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                        {roles?.map((role: any) => (
                            <SelectItem key={role.id} value={role.id.toString()}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
};