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
    const [open, setOpen] = React.useState(false);

    const hasActiveFilters = roleFilter !== "all";

    const clearFilters = () => {
        setSearchTerm("");
        setRoleFilter("all");
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
            <div className="flex flex-wrap items-center gap-2">
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
                                    {roleFilter !== "all" && "1"}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-3" align="start">
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
                                        setOpen(false);
                                    }}
                                >
                                    Limpiar filtros
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setOpen(false)}
                                >
                                    Aplicar
                                </Button>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

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