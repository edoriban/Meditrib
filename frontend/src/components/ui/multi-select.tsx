import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, X } from "lucide-react";

interface MultiSelectProps {
    options: {
        label: string;
        value: string;
        color?: string;
    }[];
    placeholder?: string;
    selected: string[];
    onChange: (selected: string[]) => void;
    className?: string;
}

export function MultiSelect({
    options,
    placeholder = "Seleccionar...",
    selected,
    onChange,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const toggleOption = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value));
        } else {
            onChange([...selected, value]);
        }
    };

    const removeOption = (value: string) => {
        onChange(selected.filter((item) => item !== value));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className={cn(
                        "flex min-h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                        {selected.map((value) => {
                            const option = options.find((opt) => opt.value === value);
                            if (!option) return null;

                            return (
                                <Badge
                                    key={value}
                                    variant="outline"
                                    style={{ backgroundColor: option.color }}
                                    className="text-white px-1.5 rounded-md"
                                >
                                    {option.label}
                                    <button
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={() => removeOption(value)}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 ml-auto opacity-50 shrink-0" />
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar..." />
                    <CommandEmpty>No hay resultados.</CommandEmpty>
                    <CommandGroup className="max-h-56 overflow-y-auto">
                        {options.map((option) => {
                            const isSelected = selected.includes(option.value);
                            return (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => toggleOption(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex items-center gap-2">
                                        <Check
                                            className={cn(
                                                "h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <Badge
                                            variant="outline"
                                            style={{ backgroundColor: option.color }}
                                            className="text-white px-1.5 rounded-md"
                                        >
                                            {option.label}
                                        </Badge>
                                    </div>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}