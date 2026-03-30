"use client";

import {memo} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Skeleton} from "@/components/ui/skeleton";
import {useCategoryDrillDown} from "@/hooks/use-dashboard";
import {CategoryIconBadge} from "@/lib/category-icons";
import {formatCurrency} from "@/lib/utils";

interface CategoryDrillDownDialogProps {
    readonly categoryId: number | null;
    readonly period: "monthly" | "yearly";
    readonly date: string;
    readonly onClose: () => void;
}

export const CategoryDrillDownDialog = memo(function CategoryDrillDownDialog({
    categoryId,
    period,
    date,
    onClose,
}: CategoryDrillDownDialogProps) {
    const {data, isLoading} = useCategoryDrillDown(categoryId, period, date);
    const drillDown = data?.data;

    return (
        <Dialog open={categoryId !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    {drillDown ? (
                        <div className="flex items-center gap-3">
                            <CategoryIconBadge
                                iconName={drillDown.main_category.icon}
                                color={drillDown.main_category.color}
                            />
                            <div>
                                <DialogTitle>{drillDown.main_category.name}</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {formatCurrency(drillDown.main_category.total)} total
                                </p>
                            </div>
                        </div>
                    ) : (
                        <DialogTitle>Category Breakdown</DialogTitle>
                    )}
                </DialogHeader>

                <div className="mt-2">
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map((k) => (
                                <div key={k} className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full shrink-0"/>
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-4 w-28"/>
                                        <Skeleton className="h-2 w-full rounded-full"/>
                                    </div>
                                    <Skeleton className="h-4 w-16 shrink-0"/>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && drillDown && (
                        drillDown.breakdown.length > 0 ? (
                            <ul className="space-y-4 list-none">
                                {drillDown.breakdown.map((item) => (
                                    <li key={item.id} className="flex items-center gap-3">
                                        {drillDown.breakdown_type === "subcategories" ? (
                                            <div
                                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                                style={{
                                                    backgroundColor: drillDown.main_category.color
                                                        ? `${drillDown.main_category.color}20`
                                                        : undefined,
                                                    color: drillDown.main_category.color ?? undefined,
                                                }}
                                            >
                                                {item.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                                {item.name.slice(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-sm font-medium tabular-nums ml-2 shrink-0">
                                                    {formatCurrency(item.total)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {item.transaction_count} txn{item.transaction_count !== 1 ? "s" : ""}
                                                </p>
                                                <p className="text-xs text-muted-foreground tabular-nums">
                                                    {item.percentage.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${item.percentage}%`,
                                                        backgroundColor: drillDown.main_category.color ?? "#94a3b8",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                No breakdown data available
                            </p>
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});
