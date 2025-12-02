import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPencil, IconCheck, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface EditablePriceCellProps {
    value: number;
    onChange: (newValue: number) => void;
    originalValue?: number;
    formatFn?: (value: number) => string;
    className?: string;
    disabled?: boolean;
}

const defaultFormat = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(value);
};

export function EditablePriceCell({
    value,
    onChange,
    originalValue,
    formatFn = defaultFormat,
    className,
    disabled = false
}: EditablePriceCellProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value.toString());
    const inputRef = useRef<HTMLInputElement>(null);

    // Detectar si el precio fue modificado
    const isModified = originalValue !== undefined && value !== originalValue;

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        if (disabled) return;
        setEditValue(value.toString());
        setIsEditing(true);
    };

    const handleConfirm = () => {
        const newValue = parseFloat(editValue);
        if (!isNaN(newValue) && newValue >= 0) {
            onChange(newValue);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(value.toString());
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleConfirm();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <Input
                    ref={inputRef}
                    type="number"
                    min="0"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleConfirm}
                    className="w-20 h-8 text-right text-sm px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-green-600"
                    onClick={handleConfirm}
                >
                    <IconCheck className="h-3 w-3" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600"
                    onClick={handleCancel}
                >
                    <IconX className="h-3 w-3" />
                </Button>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1 cursor-pointer group",
                disabled && "cursor-default",
                className
            )}
            onClick={handleStartEdit}
        >
            <span className={cn(
                "text-right",
                isModified && "text-amber-600 font-medium"
            )}>
                {formatFn(value)}
            </span>
            {!disabled && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <IconPencil className="h-3 w-3" />
                </Button>
            )}
            {isModified && (
                <span className="text-xs text-muted-foreground line-through">
                    {formatFn(originalValue!)}
                </span>
            )}
        </div>
    );
}

export default EditablePriceCell;
