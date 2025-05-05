import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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
    const [showFilters, setShowFilters] = useState(false);
    const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);
    const [profitabilityFilter, setProfitabilityFilter] = useState<"all" | "high" | "medium" | "low">("all");
    const hasActiveFilters = stockFilter !== "all" || priceRange[0] > 0 || priceRange[1] < maxPrice;

    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const filterContentRef = useRef<HTMLDivElement>(null);

    const clearFilters = () => {
        setSearchTerm("");
        setStockFilter("all");
        setPriceRange([0, maxPrice]);
        setLocalPriceRange([0, maxPrice]);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!showFilters) return;

            const target = event.target;
            if (!(target instanceof Element)) return;

            const isSelectClick = target.closest('[role="combobox"]') ||
                target.closest('[role="listbox"]') ||
                target.closest('[data-radix-select-viewport]');

            const isFilterContentClick = filterContentRef.current?.contains(target);
            const isFilterButtonClick = filterButtonRef.current?.contains(target);

            if (!isSelectClick && !isFilterContentClick && !isFilterButtonClick) {
                setShowFilters(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFilters]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
            <div className="flex flex-wrap items-center gap-2 relative">
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
                <Button
                    ref={filterButtonRef}
                    onClick={() => setShowFilters(!showFilters)}
                    variant={hasActiveFilters ? "default" : "outline"}
                    size="sm"
                >
                    <IconFilter className="mr-1 h-4 w-4" />
                    Filtros
                </Button>

                {showFilters && (
                    <div
                        ref={filterContentRef}
                        className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-md border shadow-lg p-3 w-[280px]"
                    >
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
                                    }}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

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
