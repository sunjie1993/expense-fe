"use client";

import {useState} from "react";
import {ChevronDown, ChevronRight, Pencil, Plus} from "lucide-react";
import {toast} from "sonner";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";
import {CategoryFormDialog} from "@/components/config/category-form-dialog";
import {useCategoryMutations} from "@/hooks/use-category-mutations";
import type {CategoryDetail, MainCategory} from "@/types/api";

type DialogState =
    | { open: false }
    | { open: true; mode: "create-main" }
    | { open: true; mode: "create-sub"; defaultParentId: number }
    | { open: true; mode: "edit"; category: CategoryDetail };

interface CategoryListProps {
    readonly categories: CategoryDetail[];
    readonly mainCategories: MainCategory[];
    readonly isLoading: boolean;
}

export function CategoryList({categories, mainCategories, isLoading}: CategoryListProps) {
    const {toggleActive} = useCategoryMutations();
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [dialogState, setDialogState] = useState<DialogState>({open: false});
    // Local overrides for toggle state — avoids refetch on every switch flip per backend guidance.
    // Key: category id, value: effective is_active (true = active).
    const [activeOverrides, setActiveOverrides] = useState<Map<number, boolean>>(new Map());
    const [processing, setProcessing] = useState<number | null>(null);

    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({length: 4}, (_, i) => (
                    <Skeleton key={i} className="h-11 w-full rounded-md"/>
                ))}
            </div>
        );
    }

    const mainCats = categories.filter((c) => c.parent_category_id === null);
    const subsByParent: Record<number, CategoryDetail[]> = {};
    for (const c of categories) {
        if (c.parent_category_id !== null) {
            subsByParent[c.parent_category_id] ??= [];
            subsByParent[c.parent_category_id].push(c);
        }
    }

    const getIsActive = (cat: CategoryDetail) =>
        activeOverrides.has(cat.id) ? activeOverrides.get(cat.id)! : cat.is_active === 1;

    const toggleExpand = (id: number) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleToggle = async (cat: CategoryDetail, newActive: boolean) => {
        setProcessing(cat.id);
        try {
            await toggleActive(cat.id, newActive);
            setActiveOverrides((prev) => {
                const next = new Map(prev);
                next.set(cat.id, newActive);
                // Mirror the backend cascade: deactivating a main also deactivates all its subs.
                // Re-activating a main does NOT cascade — each sub must be toggled individually.
                if (!newActive && cat.parent_category_id === null) {
                    categories
                        .filter((c) => c.parent_category_id === cat.id)
                        .forEach((sub) => next.set(sub.id, false));
                }
                return next;
            });
            toast.success(newActive ? "Category activated" : "Category deactivated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setProcessing(null);
        }
    };

    const closeDialog = () => setDialogState({open: false});

    return (
        <>
            <div className="space-y-1.5">
                {mainCats.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No categories yet.</p>
                )}

                {mainCats.map((cat) => {
                    const subs = subsByParent[cat.id] ?? [];
                    const isExpanded = expanded.has(cat.id);
                    const isActive = getIsActive(cat);
                    const isProcessing = processing === cat.id;

                    return (
                        <div
                            key={cat.id}
                            className={cn(
                                "rounded-md border bg-card overflow-hidden transition-opacity",
                                !isActive && "opacity-50"
                            )}
                        >
                            <div className="flex items-center gap-2 px-3 py-2.5">
                                <button
                                    type="button"
                                    className="flex items-center gap-2 flex-1 text-left min-w-0"
                                    aria-expanded={isExpanded}
                                    onClick={() => toggleExpand(cat.id)}
                                >
                                    {isExpanded
                                        ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground"/>
                                        : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground"/>
                                    }
                                    <span
                                        className="h-3 w-3 rounded-full shrink-0 border"
                                        style={{backgroundColor: cat.color ?? "#e5e7eb"}}
                                    />
                                    {cat.icon && (
                                        <span className="shrink-0 text-base leading-none">{cat.icon}</span>
                                    )}
                                    <span className="font-medium text-sm truncate">{cat.name}</span>
                                    {subs.length > 0 && (
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {subs.length} sub{subs.length === 1 ? "" : "s"}
                                        </span>
                                    )}
                                </button>

                                <div className="flex items-center gap-2 shrink-0">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7"
                                        disabled={isProcessing}
                                        onClick={() =>
                                            setDialogState({open: true, mode: "edit", category: cat})
                                        }
                                    >
                                        <Pencil className="h-3.5 w-3.5"/>
                                    </Button>
                                    <Switch
                                        checked={isActive}
                                        disabled={isProcessing}
                                        aria-label={`${isActive ? "Deactivate" : "Activate"} ${cat.name}`}
                                        onCheckedChange={(checked) => handleToggle(cat, checked)}
                                    />
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="border-t bg-muted/30 px-3 py-2 space-y-0.5">
                                    {subs.map((sub) => {
                                        const subIsActive = getIsActive(sub);
                                        const subIsProcessing = processing === sub.id;
                                        return (
                                            <div
                                                key={sub.id}
                                                className={cn(
                                                    "flex items-center gap-2 pl-8 py-1 transition-opacity",
                                                    !subIsActive && "opacity-50"
                                                )}
                                            >
                                                <span className="flex-1 text-sm text-muted-foreground truncate">
                                                    {sub.name}
                                                </span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        disabled={subIsProcessing}
                                                        onClick={() =>
                                                            setDialogState({
                                                                open: true,
                                                                mode: "edit",
                                                                category: sub,
                                                            })
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Switch
                                                        checked={subIsActive}
                                                        disabled={subIsProcessing}
                                                        aria-label={`${subIsActive ? "Deactivate" : "Activate"} ${sub.name}`}
                                                        onCheckedChange={(checked) =>
                                                            handleToggle(sub, checked)
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 gap-1.5 text-xs pl-8 text-muted-foreground hover:text-foreground w-full justify-start"
                                        onClick={() =>
                                            setDialogState({
                                                open: true,
                                                mode: "create-sub",
                                                defaultParentId: cat.id,
                                            })
                                        }
                                    >
                                        <Plus className="h-3.5 w-3.5"/>
                                        Add subcategory
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}

                <Button
                    variant="outline"
                    className="w-full gap-2 border-dashed"
                    onClick={() => setDialogState({open: true, mode: "create-main"})}
                >
                    <Plus className="h-4 w-4"/>
                    Add Category
                </Button>
            </div>

            <CategoryFormDialog
                open={dialogState.open}
                onOpenChange={(open) => {
                    if (!open) closeDialog();
                }}
                category={
                    dialogState.open && dialogState.mode === "edit"
                        ? dialogState.category
                        : undefined
                }
                defaultParentId={
                    dialogState.open && dialogState.mode === "create-sub"
                        ? dialogState.defaultParentId
                        : undefined
                }
                mainCategories={mainCategories}
            />
        </>
    );
}
