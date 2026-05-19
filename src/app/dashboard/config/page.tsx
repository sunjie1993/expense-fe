"use client";

import {useCallback, useMemo, useState} from "react";
import {Plus} from "lucide-react";
import {toast} from "sonner";
import {useAdminCategories, useMainCategories} from "@/hooks/use-categories";
import {useCategoryMutations} from "@/hooks/use-category-mutations";
import {PageHeader} from "@/components/dashboard/page-header";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {ErrorCard} from "@/components/ui/error-card";
import {CategoryDataTable, type CategoryRow} from "@/components/categories/category-data-table";
import {CategoryFormDialog} from "@/components/config/category-form-dialog";
import type {CategoryDetail, MainCategory} from "@/types/api";

type DialogState =
    | {open: false}
    | {open: true; mode: "create-main"}
    | {open: true; mode: "create-sub"; defaultParentId: number}
    | {open: true; mode: "edit"; category: CategoryDetail};

function buildRows(all: CategoryDetail[], activeOverrides: Map<number, boolean>): CategoryRow[] {
    const mains = all.filter((c) => c.parent_category_id === null);
    const subsByParent = new Map<number, CategoryDetail[]>();
    for (const c of all) {
        if (c.parent_category_id !== null) {
            const arr = subsByParent.get(c.parent_category_id) ?? [];
            arr.push(c);
            subsByParent.set(c.parent_category_id, arr);
        }
    }

    return mains.map((main) => {
        const subs = subsByParent.get(main.id) ?? [];
        const mainActive = activeOverrides.has(main.id)
            ? activeOverrides.get(main.id)!
            : main.is_active === 1;

        return {
            id: main.id,
            name: main.name,
            icon: main.icon,
            color: main.color,
            isMain: true,
            isActive: mainActive,
            parent_category_id: null,
            subRows: subs.length > 0
                ? subs.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                    icon: sub.icon,
                    color: sub.color,
                    isMain: false,
                    isActive: activeOverrides.has(sub.id)
                        ? activeOverrides.get(sub.id)!
                        : sub.is_active === 1,
                    parent_category_id: sub.parent_category_id,
                }))
                : undefined,
        };
    });
}

export default function ConfigPage() {
    const {data: adminData, error, isLoading: loadingAdmin} = useAdminCategories();
    const {data: mainCatsData, isLoading: loadingMain} = useMainCategories();
    const {remove, toggleActive} = useCategoryMutations();

    const [dialogState, setDialogState] = useState<DialogState>({open: false});
    const [activeOverrides, setActiveOverrides] = useState<Map<number, boolean>>(new Map());
    const [processingId, setProcessingId] = useState<number | null>(null);

    const isLoading = loadingAdmin || loadingMain;
    const all = useMemo(() => adminData?.data ?? [], [adminData]);
    const mainCategories = useMemo<MainCategory[]>(() => mainCatsData?.data ?? [], [mainCatsData]);

    const rows = useMemo(() => buildRows(all, activeOverrides), [all, activeOverrides]);

    const closeDialog = useCallback(() => setDialogState({open: false}), []);

    const handleEdit = useCallback((row: CategoryRow) => {
        const detail = all.find((c) => c.id === row.id);
        if (detail) setDialogState({open: true, mode: "edit", category: detail});
    }, [all]);

    const handleAddSub = useCallback((parentId: number) => {
        setDialogState({open: true, mode: "create-sub", defaultParentId: parentId});
    }, []);

    const handleToggleActive = useCallback(async (row: CategoryRow, active: boolean) => {
        setProcessingId(row.id);
        try {
            await toggleActive(row.id, active);
            setActiveOverrides((prev) => {
                const next = new Map(prev);
                next.set(row.id, active);
                // Deactivating a main cascades to all its subs; activating does not.
                if (!active && row.isMain) {
                    (row.subRows ?? []).forEach((sub) => next.set(sub.id, false));
                }
                return next;
            });
            toast.success(active ? "Activated" : "Deactivated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update");
        } finally {
            setProcessingId(null);
        }
    }, [toggleActive]);

    const handleDelete = useCallback((row: CategoryRow) => {
        toast.warning(`Delete "${row.name}"?`, {
            description: row.isMain ? "All subcategories will also be removed." : undefined,
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await remove(row.id);
                        toast.success(`"${row.name}" deleted`);
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to delete");
                    }
                },
            },
            cancel: {label: "Cancel", onClick: () => {}},
        });
    }, [remove]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader
                title="Config"
                description="Manage expense categories and subcategories"
                actions={
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => setDialogState({open: true, mode: "create-main"})}
                    >
                        <Plus className="h-4 w-4"/>
                        Add Category
                    </Button>
                }
            />

            <div className="p-4">
                {error && !all.length && (
                    <ErrorCard title="Failed to load categories"/>
                )}

                {isLoading ? (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {Array.from({length: 6}, (_, i) => (
                                <Skeleton key={`skeleton-${i}`} className="h-10 w-full"/>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <CategoryDataTable
                                data={rows}
                                processingId={processingId}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                                onAddSub={handleAddSub}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <CategoryFormDialog
                open={dialogState.open}
                onOpenChange={(open) => { if (!open) closeDialog(); }}
                category={dialogState.open && dialogState.mode === "edit" ? dialogState.category : undefined}
                defaultParentId={dialogState.open && dialogState.mode === "create-sub" ? dialogState.defaultParentId : undefined}
                mainCategories={mainCategories}
            />
        </div>
    );
}
