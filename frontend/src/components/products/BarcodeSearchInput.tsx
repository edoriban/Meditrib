import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_API_URL } from "@/config";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconBarcode, IconSearch, IconX, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BarcodeSearchInputProps {
    onProductSelect: (product: Product) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    excludeIds?: number[]; // IDs de productos a excluir de resultados
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
};

export function BarcodeSearchInput({
    onProductSelect,
    placeholder = "Buscar por código de barras o nombre...",
    className,
    disabled = false,
    autoFocus = false,
    excludeIds = []
}: BarcodeSearchInputProps) {
    const [searchValue, setSearchValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [isBarcodeMode, setIsBarcodeMode] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const lastKeyTime = useRef<number>(0);

    // Detectar si es un escáner de código de barras
    // Los escáneres típicamente envían caracteres muy rápido (< 50ms entre teclas)
    const detectBarcodeScanner = useCallback((currentTime: number) => {
        const timeDiff = currentTime - lastKeyTime.current;
        lastKeyTime.current = currentTime;

        // Si el tiempo entre teclas es muy corto, probablemente es un escáner
        return timeDiff < 50;
    }, []);

    // Query para búsqueda
    const { data: searchResults, isLoading, isFetching } = useQuery<Product[]>({
        queryKey: ["product-search", searchValue],
        queryFn: async () => {
            if (!searchValue || searchValue.length < 2) return [];

            // Usar el endpoint paginado que tiene búsqueda case-insensitive
            const params = new URLSearchParams({
                page: "1",
                page_size: "20",
                search: searchValue,
                stock_filter: "all"
            });
            const { data } = await axios.get(`${BASE_API_URL}/products/paginated?${params}`);
            return data.items || [];
        },
        enabled: searchValue.length >= 2,
        staleTime: 1000,
    });

    // Filtrar resultados excluyendo IDs especificados
    const filteredResults = searchResults?.filter(
        product => !excludeIds.includes(product.id)
    ) || [];

    // Manejar cambio de input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const currentTime = Date.now();

        // Detectar modo escáner
        if (detectBarcodeScanner(currentTime) && /^\d+$/.test(value)) {
            setIsBarcodeMode(true);
        }

        setSearchValue(value);
        setShowDropdown(true);
    };

    // Manejar selección de producto
    const handleSelect = (product: Product) => {
        onProductSelect(product);
        setSearchValue("");
        setShowDropdown(false);
        setIsBarcodeMode(false);
        inputRef.current?.focus();
    };

    // Manejar tecla Enter (para escáner)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // Si hay resultados y es modo barcode, seleccionar el primero
            if (filteredResults.length === 1 || (isBarcodeMode && filteredResults.length > 0)) {
                handleSelect(filteredResults[0]);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
            setSearchValue("");
        }
    };

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-focus
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className={cn("relative", className)} ref={dropdownRef}>
            <div className="relative">
                {isBarcodeMode ? (
                    <IconBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                ) : (
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => searchValue && setShowDropdown(true)}
                    disabled={disabled}
                    className={cn(
                        "pl-9 pr-8",
                        isBarcodeMode && "border-primary ring-1 ring-primary"
                    )}
                />
                {searchValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => {
                            setSearchValue("");
                            setShowDropdown(false);
                            setIsBarcodeMode(false);
                            inputRef.current?.focus();
                        }}
                    >
                        <IconX className="h-3 w-3" />
                    </Button>
                )}
            </div>

            {/* Dropdown de resultados */}
            {showDropdown && searchValue.length >= 2 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
                    {(isLoading || isFetching) ? (
                        <div className="flex items-center justify-center py-6">
                            <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <span className="ml-2 text-sm text-muted-foreground">Buscando...</span>
                        </div>
                    ) : filteredResults.length === 0 ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No se encontraron productos
                        </div>
                    ) : (
                        filteredResults.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelect(product)}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                            >
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-medium truncate">{product.name}</span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        {product.barcode && (
                                            <span className="flex items-center gap-1">
                                                <IconBarcode className="h-3 w-3" />
                                                {product.barcode}
                                            </span>
                                        )}
                                        {product.laboratory && (
                                            <span>• {product.laboratory} • {product.active_substance}</span>
                                            
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end ml-2">
                                    <span className="font-semibold text-sm">
                                        {formatCurrency(product.sale_price)}
                                    </span>
                                    <Badge
                                        variant={product.inventory?.quantity && product.inventory.quantity > 0 ? "secondary" : "destructive"}
                                        className="text-xs"
                                    >
                                        Stock: {product.inventory?.quantity || 0}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Indicador de modo barcode */}
            {isBarcodeMode && (
                <p className="text-xs text-primary mt-1">
                    Modo escáner activado - Presiona Enter para agregar
                </p>
            )}
        </div>
    );
}

export default BarcodeSearchInput;
