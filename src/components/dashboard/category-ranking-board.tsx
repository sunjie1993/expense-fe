"use client";

import {type CSSProperties, memo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Award, Medal, Trophy} from "lucide-react";
import type {CategoryRanking} from "@/types/api";
import {CategoryIcon} from "@/lib/category-icons";
import {formatCurrency} from "@/lib/utils";

interface CategoryRankingBoardProps {
    readonly categories: CategoryRanking[];
}

/**
 * Get the appropriate rank icon based on position
 * @param rank - The rank position (1-based)
 * @returns React element for the rank icon
 */
function getRankIcon(rank: number) {
    const iconClass = "h-5 w-5";

    switch (rank) {
        case 1:
            return <Trophy className={`${iconClass} text-yellow-500`} aria-label="First place"/>;
        case 2:
            return <Medal className={`${iconClass} text-gray-400`} aria-label="Second place"/>;
        case 3:
            return <Award className={`${iconClass} text-amber-700`} aria-label="Third place"/>;
        default:
            return (
                <div
                    className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
                    aria-label={`Rank ${rank}`}
                >
                    {rank}
                </div>
            );
    }
}

/**
 * CategoryRankingBoard displays a ranked list of spending categories
 */
export const CategoryRankingBoard = memo(function CategoryRankingBoard({
                                                                           categories,
                                                                       }: CategoryRankingBoardProps) {
    const hasCategories = categories && categories.length > 0;

    return (
        <Card className="elevation-2 hover:elevation-4 transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Category Rankings
                </CardTitle>
                <CardDescription>
                    {hasCategories
                        ? "Your top spending categories ranked by total amount"
                        : "No spending data to display"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {hasCategories ? (
                    <ul className="space-y-3 list-none" aria-label="Category rankings">
                        {categories.map((category) => {
                            const isTopThree = category.rank <= 3;
                            return (
                                <li
                                    key={category.main_category_id}
                                    className={`relative flex items-center gap-3 p-4 rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-left category-rank-animation group
                                        ${isTopThree
                                            ? 'bg-primary/5 hover:bg-primary/10 elevation-1 hover:elevation-2'
                                            : 'bg-muted/30 hover:bg-muted/50'
                                        }`}
                                >
                                    {/* Rank badge with special styling for top 3 */}
                                    <div className={`shrink-0 ${isTopThree ? 'scale-110' : ''}`} aria-hidden="true">
                                        {getRankIcon(category.rank)}
                                    </div>

                                    {/* Category icon with subtle hover effect */}
                                    <div
                                        className="shrink-0 h-12 w-12 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                                        style={{backgroundColor: `${category.color}20`}}
                                        aria-hidden="true"
                                    >
                                        <CategoryIcon
                                            iconName={category.icon}
                                            className="h-6 w-6"
                                            color={category.color}
                                        />
                                    </div>

                                    {/* Category details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {category.main_category_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {category.transaction_count} transaction
                                            {category.transaction_count === 1 ? "" : "s"}
                                        </p>
                                        {/* Progress bar under category name */}
                                        <div className="mt-2 w-full">
                                            <progress
                                                className="progress-bar"
                                                value={category.percentage}
                                                max={100}
                                                aria-label={`${category.percentage.toFixed(1)}% of total spending`}
                                                style={{"--progress-color": category.color} as CSSProperties}
                                            />
                                        </div>
                                    </div>

                                    {/* Amount and percentage */}
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm tabular-nums">
                                            {formatCurrency(category.total)}
                                        </p>
                                        <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                                            {category.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 space-y-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground text-center">
                            No category data available for this period
                        </p>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                            Add some expenses to see your spending breakdown
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});