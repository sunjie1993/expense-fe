"use client";

import {useCallback, useMemo, useState} from "react";
import {useSWRConfig} from "swr";
import {toast} from "sonner";
import {useMainCategories, useAllCategories} from "@/hooks/use-categories";
import {PageHeader} from "@/components/dashboard/page-header";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {ErrorCard} from "@/components/ui/error-card";
import {CategoryDataTable, type CategoryRow} from "@/components/categories/category-data-table";
import {CategoryEditDialog} from "@/components/categories/category-edit-dialog";
import {apiDelete, apiPut} from "@/lib/api";
import type {Category, MainCategory} from "@/types/api";

function buildRows(
    mains: MainCategory[],
    all: Category[],
    activeOverrides: Map<number, boolean>,
): CategoryRow[] {
    const subsByParent = new Map<number, Category[]>();
    for (const cat of all) {
        if (cat.parent_category_id !== null) {
            const arr = subsByParent.get(cat.parent_category_id) ?? [];
            arr.push(cat);
            subsByParent.set(cat.parent_category_id, arr);
        }
    }

    return mains.map((main) => {
        const subs = subsByParent.get(main.id) ?? [];
        return {
            id: main.id,
            name: main.name,
            icon: main.icon,
            color: main.color,
            isMain: true,
            isActive: activeOverrides.get(main.id) ?? true,
            subRows: subs.length > 0
                ? subs.map((sub) => ({
                    id: sub.id,
                    name: sub.name,
                    icon: sub.icon,
                    color: sub.color,
                    isMain: false,
                    isActive: activeOverrides.get(sub.id) ?? true,
                }))
                : undefined,
        };
    });
}

export default function CategoriesPage() {
    const {mutate} = useSWRConfig();
    const {data: mainsData, error: mainsError, isLoading: mainsLoading} = useMainCategories();
    const {data: allData, error: allError, isLoading: allLoading} = useAllCategories();

    const [editingRow, setEditingRow] = useState<CategoryRow | null>(null);
    const [activeOverrides, setActiveOverrides] = useState<Map<number, boolean>>(new Map());

    const isLoading = mainsLoading || allLoading;
    const error = mainsError || allError;

    const rows = useMemo(() => {
        if (!mainsData?.data || !allData?.data) return [];
        return buildRows(mainsData.data, allData.data, activeOverrides);
    }, [mainsData, allData, activeOverrides]);

    const refreshCategories = useCallback(() => {
        mutate("/api/categories/main");
        mutate("/api/categories/all");
    }, [mutate]);

    const handleToggleActive = useCallback(async (row: CategoryRow, active: boolean) => {
        setActiveOverrides((prev) => new Map(prev).set(row.id, active));
        try {
            await apiPut(`/api/categories/${row.id}`, {is_active: active});
            toast.success(`${row.name} ${active ? "activated" : "deactivated"}`);
        } catch {
            setActiveOverrides((prev) => {
                const next = new Map(prev);
                next.set(row.id, !active);
                return next;
            });
            toast.error(`Failed to ${active ? "activate" : "deactivate"} ${row.name}`);
        }
    }, []);

    const handleDelete = useCallback((row: CategoryRow) => {
        toast.warning(`Delete "${row.name}"?`, {
            description: row.isMain
                ? "This will also remove all its subcategories."
                : undefined,
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await apiDelete(`/api/categories/${row.id}`);
                        toast.success(`"${row.name}" deleted`);
                        refreshCategories();
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to delete category");
                    }
                },
            },
            cancel: {
                label: "Cancel",
                onClick: () => {},
            },
        });
    }, [refreshCategories]);

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader
                title="Categories"
                description="Manage expense categories and subcategories"
            />

            <div className="p-4">
                {error && !rows.length && (
                    <ErrorCard title="Failed to load categories"/>
                )}

                {isLoading ? (
                    <Card>
                        <CardContent className="p-4 space-y-3">
                            {Array.from({length: 7}).map((_, i) => (
                                <Skeleton key={i} className="h-10 w-full"/>
                            ))}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <CategoryDataTable
                                data={rows}
                                onEdit={setEditingRow}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        </CardContent>
                    </Card>
                )}
            </div>

            <CategoryEditDialog
                row={editingRow}
                open={editingRow !== null}
                onOpenChange={(open) => { if (!open) setEditingRow(null); }}
                onSuccess={refreshCategories}
            />
        </div>
    );
}
