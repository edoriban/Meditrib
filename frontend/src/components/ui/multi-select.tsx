import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X, Plus } from "lucide-react";
import { Button } from "./button";

interface MultiSelectProps {
    options: {
        label: string;
        value: string;
        color?: string;
    }[];
    placeholder?: string;
    selected: string[];
    onChange: (selected: string[]) => void;
    onCreateClick?: () => void;
    className?: string;
}

export function MultiSelect({
    options,
    placeholder = "Seleccionar...",
    selected,
    onChange,
    onCreateClick,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    // Esta función se llama cuando se selecciona una opción desde el menú
    const handleSelect = React.useCallback(
        (value: string) => {
            setInputValue("");
            if (selected.includes(value)) {
                onChange(selected.filter((item) => item !== value));
            } else {
                onChange([...selected, value]);
            }
            // NO cerramos el popover para permitir múltiples selecciones
        },
        [onChange, selected]
    );

    // Esta función se llama cuando se hace clic en el botón X de un badge
    const handleRemove = React.useCallback(
        (value: string) => {
            onChange(selected.filter((item) => item !== value));
        },
        [onChange, selected]
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "flex min-h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex-wrap",
                        className
                    )}
                    onClick={() => setOpen(true)}
                >
                    {selected.length === 0 && (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <div className="flex flex-wrap gap-1">
                        {selected.map((value) => {
                            const option = options.find((opt) => opt.value === value);
                            if (!option) return null;

                            return (
                                <Badge
                                    key={value}
                                    variant="outline"
                                    style={{ backgroundColor: option.color || "#6366f1" }}
                                    className="text-white px-1.5 rounded-md"
                                >
                                    {option.label}
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(value);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 ml-auto opacity-50 shrink-0 self-center" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandEmpty>
                        <div className="py-2 px-2 text-center text-sm">
                            No hay resultados.
                            {onCreateClick && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setOpen(false);
                                        onCreateClick();
                                    }}
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Crear nuevo tipo
                                </Button>
                            )}
                        </div>
                    </CommandEmpty>
                    <CommandGroup className="max-h-56 overflow-y-auto">
                        {options
                            .filter(option =>
                                option.label.toLowerCase().includes(inputValue.toLowerCase())
                            )
                            .map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={(currentValue) => {
                                            handleSelect(option.value);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-2 flex-1">
                                            <div className="flex-0 mr-2">
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                            </div>
                                            <Badge
                                                variant="outline"
                                                style={{ backgroundColor: option.color || "#6366f1" }}
                                                className="text-white px-1.5 rounded-md"
                                            >
                                                {option.label}
                                            </Badge>
                                        </div>
                                    </CommandItem>
                                );
                            })}
                    </CommandGroup>
                    {onCreateClick && options.length > 0 && (
                        <div className="border-t p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setOpen(false);
                                    onCreateClick();
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Crear nuevo tipo
                            </Button>
                        </div>
                    )}
                </Command>
            </PopoverContent>
        </Popover>
    );
}