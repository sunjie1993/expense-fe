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
    const iconClass = "h-6 w-6";

    switch (rank) {
        case 1:
            return (
                <div className="relative">
                    <Trophy className={`${iconClass} text-yellow-500 drop-shadow-lg`} aria-label="First place"/>
                    <div className="absolute inset-0 blur-md bg-yellow-500/50 -z-10" />
                </div>
            );
        case 2:
            return (
                <div className="relative">
                    <Medal className={`${iconClass} text-gray-400 drop-shadow-lg`} aria-label="Second place"/>
                    <div className="absolute inset-0 blur-md bg-gray-400/50 -z-10" />
                </div>
            );
        case 3:
            return (
                <div className="relative">
                    <Award className={`${iconClass} text-amber-600 drop-shadow-lg`} aria-label="Third place"/>
                    <div className="absolute inset-0 blur-md bg-amber-600/50 -z-10" />
                </div>
            );
        default:
            return (
                <div
                    className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground"
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
        <Card className="glass-card glass-hover elevation-2 hover:elevation-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-chart-2/5 via-transparent to-chart-4/5 pointer-events-none" />
            <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-yellow-400 to-amber-600 flex items-center justify-center shadow-lg">
                        <Trophy className="h-5 w-5 text-white"/>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            Category Rankings
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {hasCategories
                                ? "Your top spending categories ranked by total amount"
                                : "No spending data to display"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
                {hasCategories ? (
                    <ul className="space-y-3 list-none" aria-label="Category rankings">
                        {categories.map((category) => {
                            const isTopThree = category.rank <= 3;
                            return (
                                <li
                                    key={category.main_category_id}
                                    className={`relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-left category-rank-animation group
                                        ${isTopThree
                                        ? 'glass-card elevation-2 hover:elevation-4 border-2 shimmer'
                                        : 'bg-muted/20 hover:bg-muted/40'
                                    }`}
                                    style={isTopThree ? {
                                        borderColor: `${category.color}40`,
                                        background: `linear-gradient(135deg, ${category.color}08 0%, transparent 100%)`
                                    } : undefined}
                                >
                                    <div className={`shrink-0 ${isTopThree ? 'scale-110' : ''}`} aria-hidden="true">
                                        {getRankIcon(category.rank)}
                                    </div>

                                    <div
                                        className="shrink-0 h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
                                        style={{
                                            backgroundColor: `${category.color}20`,
                                            boxShadow: isTopThree ? `0 4px 20px ${category.color}40` : undefined
                                        }}
                                        aria-hidden="true"
                                    >
                                        <CategoryIcon
                                            iconName={category.icon}
                                            className="h-7 w-7"
                                            color={category.color}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${isTopThree ? 'text-foreground' : ''}`}>
                                            {category.main_category_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {category.transaction_count} transaction
                                            {category.transaction_count === 1 ? "" : "s"}
                                        </p>
                                        <div className="mt-2.5 w-full">
                                            <progress
                                                className="progress-bar"
                                                value={category.percentage}
                                                max={100}
                                                aria-label={`${category.percentage.toFixed(1)}% of total spending`}
                                                style={{
                                                    "--progress-color": category.color,
                                                    "--progress-color-light": `${category.color}99`
                                                } as CSSProperties}
                                            />
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <p className={`font-bold tabular-nums ${isTopThree ? 'text-base' : 'text-sm'}`}>
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
                            <Trophy className="h-8 w-8 text-muted-foreground/50"/>
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