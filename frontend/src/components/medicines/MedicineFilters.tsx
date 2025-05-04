import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

interface MedicineFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    stockFilter: "all" | "in-stock" | "out-of-stock";
    setStockFilter: (filter: "all" | "in-stock" | "out-of-stock") => void;
    priceRange: [number, number];
    setPriceRange: (range: [number, number]) => void;
    maxPrice: number;
    resultsCount: number;
}

export function MedicineFilters({
    searchTerm,
    setSearchTerm,
    stockFilter,
    setStockFilter,
    priceRange,
    setPriceRange,
    maxPrice,
    resultsCount
}: MedicineFiltersProps) {
    const [open, setOpen] = React.useState(false);
    const [localPriceRange, setLocalPriceRange] = React.useState<[number, number]>(priceRange);

    const hasActiveFilters = stockFilter !== "all" || priceRange[0] > 0 || priceRange[1] < maxPrice;

    const clearFilters = () => {
        setSearchTerm("");
        setStockFilter("all");
        setPriceRange([0, maxPrice]);
        setLocalPriceRange([0, maxPrice]);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
            <div className="flex flex-wrap items-center gap-2">
                {/* Barra de búsqueda */}
                <div className="relative">
                    <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar medicamentos..."
                        className="pl-8 w-[250px] sm:w-[300px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <IconX className="h-4 w-4" />
                            <span className="sr-only">Limpiar búsqueda</span>
                        </button>
                    )}
                </div>

                {/* Botón de filtro con indicador */}
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant={hasActiveFilters ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                hasActiveFilters && "bg-primary text-primary-foreground"
                            )}
                        >
                            <IconFilter className="mr-1 h-4 w-4" />
                            Filtros
                            {hasActiveFilters && (
                                <Badge
                                    variant="outline"
                                    className="ml-2 bg-background text-foreground"
                                >
                                    {(stockFilter !== "all" ? 1 : 0) +
                                        ((priceRange[0] > 0 || priceRange[1] < maxPrice) ? 1 : 0)}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[280px] p-3" align="start">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Filtrar por stock</h4>
                                <Select
                                    value={stockFilter}
                                    onValueChange={(value: "all" | "in-stock" | "out-of-stock") => {
                                        setStockFilter(value);
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Estado de stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los medicamentos</SelectItem>
                                        <SelectItem value="in-stock">En stock</SelectItem>
                                        <SelectItem value="out-of-stock">Sin stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Rango de precio (venta)</h4>
                                <div className="pt-4 px-2">
                                    <Slider
                                        defaultValue={priceRange}
                                        min={0}
                                        max={maxPrice}
                                        step={1}
                                        value={localPriceRange}
                                        onValueChange={(value) => {
                                            setLocalPriceRange(value as [number, number]);
                                        }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-2 text-sm">
                                    <div>${localPriceRange[0]}</div>
                                    <div>${localPriceRange[1]}</div>
                                </div>
                            </div>

                            <Separator />
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        clearFilters();
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                        setPriceRange(localPriceRange);
                                        setOpen(false);
                                    }}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Mostrar filtros activos */}
                {stockFilter !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                        {stockFilter === "in-stock" ? "En stock" : "Sin stock"}
                        <button
                            type="button"
                            onClick={() => setStockFilter("all")}
                            className="ml-1"
                        >
                            <IconX className="h-3 w-3" />
                            <span className="sr-only">Quitar filtro de stock</span>
                        </button>
                    </Badge>
                )}

                {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                    <Badge variant="secondary" className="gap-1">
                        Precio: ${priceRange[0]} - ${priceRange[1]}
                        <button
                            type="button"
                            onClick={() => setPriceRange([0, maxPrice])}
                            className="ml-1"
                        >
                            <IconX className="h-3 w-3" />
                            <span className="sr-only">Quitar filtro de precio</span>
                        </button>
                    </Badge>
                )}
            </div>

            <div className="text-sm text-muted-foreground">
                {resultsCount} medicamentos encontrados
            </div>
        </div>
    );
}
