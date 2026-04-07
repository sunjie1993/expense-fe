"use client";

import {memo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import type {CategoryRanking} from "@/types/api";
import {CategoryIconBadge} from "@/lib/category-icons";
import {formatCurrency} from "@/lib/utils";

interface CategoryRankingBoardProps {
    readonly categories: CategoryRanking[];
    readonly onCategoryClick?: (categoryId: number) => void;
}

interface CategoryRowProps {
    readonly category: CategoryRanking;
    readonly onClick?: () => void;
}

function CategoryRow({category, onClick}: CategoryRowProps) {
    const content = (
        <>
            <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground text-right">
                #{category.rank}
            </span>
            <CategoryIconBadge iconName={category.icon} color={category.color}/>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                    {category.main_category_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {category.transaction_count} transaction{category.transaction_count === 1 ? "" : "s"}
                </p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full rounded-full"
                        style={{width: `${category.percentage}%`, backgroundColor: category.color}}
                    />
                </div>
            </div>
            <div className="text-right shrink-0">
                <p className="text-sm font-medium tabular-nums">{formatCurrency(category.total)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{category.percentage.toFixed(1)}%</p>
            </div>
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-1 py-0.5 -mx-1 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={onClick}
                aria-label={`View breakdown for ${category.main_category_name}`}
            >
                {content}
            </button>
        );
    }

    return <div className="flex items-center gap-3">{content}</div>;
}

export const CategoryRankingBoard = memo(function CategoryRankingBoard({
                                                                           categories,
                                                                           onCategoryClick,
                                                                       }: CategoryRankingBoardProps) {
    const hasCategories = categories && categories.length > 0;

    let description: string;
    if (!hasCategories) {
        description = "No spending data to display";
    } else if (onCategoryClick) {
        description = "Tap a category to see the breakdown";
    } else {
        description = "Top spending categories this period";
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Category Rankings</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {hasCategories ? (
                    <ul className="space-y-4 list-none" aria-label="Category rankings">
                        {categories.map((category) => (
                            <li key={category.main_category_id}>
                                <CategoryRow
                                    category={category}
                                    onClick={onCategoryClick ? () => onCategoryClick(category.main_category_id) : undefined}
                                />
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
