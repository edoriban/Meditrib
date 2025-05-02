import * as React from "react"
import { Controller } from "react-hook-form"
import { Control, FieldValues, Path, FieldErrors } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type FormInputProps<T extends FieldValues> = {
    name: Path<T> // Asegura que el nombre coincida con una propiedad del esquema
    control: Control<T>
    errors?: FieldErrors<T>
    label?: string
    placeholder?: string
    type?: React.InputHTMLAttributes<HTMLInputElement>["type"]
    required?: boolean
    className?: string
}

export function FormInput<T extends FieldValues>({
    name,
    control,
    errors,
    label,
    placeholder,
    type = "text",
    required = false,
    className,
    ...props
}: FormInputProps<T>) {
    return (
        <div className="grid gap-2">
            {label && (
                <Label htmlFor={name} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                    {label}
                </Label>
            )}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Input
                        id={name}
                        type={type}
                        placeholder={placeholder}
                        className={className}
                        {...field}
                        {...props}
                    />
                )}
            />
            {errors?.[name] && (
                <p className="text-xs text-red-500">
                    {errors[name]?.message as string}
                </p>
            )}
        </div>
    )
}