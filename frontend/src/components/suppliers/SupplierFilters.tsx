import { Input } from "@/components/ui/input";
import { IconSearch, IconX } from "@tabler/icons-react";

interface SupplierFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    resultsCount: number;
}

export function SupplierFilters({
    searchTerm,
    setSearchTerm,
    resultsCount
}: SupplierFiltersProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
            <div className="flex flex-wrap items-center gap-2 relative">
                {/* Barra de búsqueda */}
                <div className="relative">
                    <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar proveedores..."
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
            </div>

            <div className="text-sm text-muted-foreground">
                {resultsCount} proveedores encontrados
            </div>
        </div>
    );
}