import * as React from "react";
import { cn } from "@/lib/utils";

interface TagToggleGroupProps {
    tags: Array<{
        id: number | string;
        name: string;
        color?: string;
    }>;
    selectedTags: string[] | undefined;
    onChange: (selectedTags: string[]) => void;
    className?: string;
    placeholder?: string;
}

export function TagToggleGroup({
    tags,
    selectedTags = [],
    onChange,
    className,
    placeholder = "Selecciona uno o más tipos"
}: TagToggleGroupProps) {
    const handleTagToggle = (tagId: string) => {
        const newSelectedTags = [...selectedTags];
        const tagIndex = newSelectedTags.indexOf(tagId);

        if (tagIndex >= 0) {
            newSelectedTags.splice(tagIndex, 1);
        } else {
            newSelectedTags.push(tagId);
        }

        onChange(newSelectedTags);
    };

    return (
        <div className={cn("border rounded-md p-3", className)}>
            {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                    No hay tipos disponibles
                </p>
            ) : (
                <>
                    {selectedTags.length === 0 && (
                        <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => handleTagToggle(tag.id.toString())}
                                className={cn(
                                    "px-3 py-1 rounded-full text-sm font-medium transition-all",
                                    selectedTags.includes(tag.id.toString())
                                        ? "opacity-100 ring-2 ring-primary ring-offset-1"
                                        : "opacity-80 hover:opacity-100"
                                )}
                                style={{
                                    backgroundColor: tag.color || "#6366f1",
                                    color: "#ffffff"
                                }}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}