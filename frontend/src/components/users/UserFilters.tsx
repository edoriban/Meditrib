import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconSearch, IconFilter, IconX } from "@tabler/icons-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UserFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    roleFilter: number | "all";
    setRoleFilter: (roleId: number | "all") => void;
    roles: any[] | undefined;
    resultsCount: number;
}

export function UserFilters({
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    roles,
    resultsCount
}: UserFiltersProps) {
    const [showFilters, setShowFilters] = useState(false);

    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const filterContentRef = useRef<HTMLDivElement>(null);

    const hasActiveFilters = roleFilter !== "all";

    const clearFilters = () => {
        setSearchTerm("");
        setRoleFilter("all");
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
                console.log('Cerrando filtros por clic externo');
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
                        placeholder="Buscar usuarios..."
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

                {/* Botón de filtro con indicador  */}
                <Button
                    ref={filterButtonRef}
                    onClick={() => setShowFilters(!showFilters)}
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
                            1
                        </Badge>
                    )}
                </Button>

                {/* Contenido del filtro*/}
                {showFilters && (
                    <div
                        ref={filterContentRef}
                        className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-md border shadow-lg p-3 w-[220px]"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Filtrar por rol</h4>
                                <Select
                                    value={roleFilter === "all" ? "all" : roleFilter.toString()}
                                    onValueChange={(value) => {
                                        setRoleFilter(value === "all" ? "all" : parseInt(value));
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos los roles</SelectItem>
                                        {roles?.map(role => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        clearFilters();
                                        setShowFilters(false);
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setShowFilters(false)}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mostrar filtros activos */}
                {hasActiveFilters && (
                    <div className="flex gap-1">
                        <Badge variant="secondary" className="gap-1">
                            Rol: {roles?.find(r => r.id === roleFilter)?.name}
                            <button
                                type="button"
                                onClick={() => setRoleFilter("all")}
                                className="ml-1"
                            >
                                <IconX className="h-3 w-3" />
                                <span className="sr-only">Quitar filtro de rol</span>
                            </button>
                        </Badge>
                    </div>
                )}
            </div>

            <div className="text-sm text-muted-foreground">
                {resultsCount} usuarios encontrados
            </div>
        </div>
    );
}