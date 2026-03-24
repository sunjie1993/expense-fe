"use client";

import {memo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {CategoryRanking} from "@/types/api";
import {CategoryIcon} from "@/lib/category-icons";
import {formatCurrency} from "@/lib/utils";

interface CategoryRankingBoardProps {
    readonly categories: CategoryRanking[];
}

export const CategoryRankingBoard = memo(function CategoryRankingBoard({categories}: CategoryRankingBoardProps) {
    const hasCategories = categories && categories.length > 0;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Category Rankings</CardTitle>
                <CardDescription>
                    {hasCategories
                        ? "Top spending categories this period"
                        : "No spending data to display"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasCategories ? (
                    <ul className="space-y-4 list-none" aria-label="Category rankings">
                        {categories.map((category) => (
                            <li key={category.main_category_id} className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                    style={{backgroundColor: `${category.color}20`}}
                                    aria-hidden="true"
                                >
                                    <CategoryIcon
                                        iconName={category.icon}
                                        className="h-4 w-4"
                                        color={category.color}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">
                                        {category.main_category_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {category.transaction_count} transaction{category.transaction_count === 1 ? "" : "s"}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-medium tabular-nums">
                                        {formatCurrency(category.total)}
                                    </p>
                                    <p className="text-xs text-muted-foreground tabular-nums">
                                        {category.percentage.toFixed(1)}%
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">No category data for this period</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
