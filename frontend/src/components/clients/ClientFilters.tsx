import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ClientFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
}

export function ClientFilters({ searchTerm, onSearchChange }: ClientFiltersProps) {
    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-8"
                />
            </div>
        </div>
    );
}