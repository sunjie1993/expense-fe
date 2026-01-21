"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import type { CategoryRanking } from "@/types/api";
import { CategoryIcon } from "@/lib/category-icons";
import { formatCurrency } from "@/lib/utils";

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
      return <Trophy className={`${iconClass} text-yellow-500`} aria-label="First place" />;
    case 2:
      return <Medal className={`${iconClass} text-gray-400`} aria-label="Second place" />;
    case 3:
      return <Award className={`${iconClass} text-amber-700`} aria-label="Third place" />;
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
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Category Rankings</CardTitle>
        <CardDescription>
          {hasCategories
            ? "Your top spending categories ranked by total amount"
            : "No spending data to display"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasCategories ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              No category data available for this period
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Add some expenses to see your spending breakdown
            </p>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="Category rankings">
            {categories.map((category, index) => (
              <div
                key={category.main_category_id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-all duration-200 hover:shadow-sm animate-in fade-in slide-in-from-left"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
                role="listitem"
              >
                <div className="shrink-0" aria-hidden="true">
                  {getRankIcon(category.rank)}
                </div>

                <div
                  className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: `${category.color}20` }}
                  aria-hidden="true"
                >
                  <CategoryIcon
                    iconName={category.icon}
                    className="h-5 w-5"
                    color={category.color}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {category.main_category_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {category.transaction_count} transaction
                    {category.transaction_count !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold text-sm tabular-nums">
                    {formatCurrency(category.total)}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {category.percentage.toFixed(1)}%
                  </p>
                </div>

                <div className="w-16 shrink-0" aria-hidden="true">
                  <div
                    className="h-2 bg-background rounded-full overflow-hidden"
                    role="progressbar"
                    aria-valuenow={category.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${category.percentage.toFixed(1)}% of total spending`}
                  >
                    <div
                      className="h-full transition-all duration-500 ease-out"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});