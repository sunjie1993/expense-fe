"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";
import type { CategoryRanking } from "@/types/api";

interface CategoryRankingBoardProps {
  categories: CategoryRanking[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return (
        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {rank}
        </div>
      );
  }
}

export function CategoryRankingBoard({ categories }: CategoryRankingBoardProps) {
  if (!categories || categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Rankings</CardTitle>
          <CardDescription>Top spending categories</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No category data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Rankings</CardTitle>
        <CardDescription>Top spending categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.main_category_id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="shrink-0">{getRankIcon(category.rank)}</div>

              <div className="shrink-0 text-2xl">{category.icon}</div>

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
                <p className="font-bold text-sm">
                  {formatCurrency(category.total)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </p>
              </div>

              <div className="w-16 shrink-0">
                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
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
      </CardContent>
    </Card>
  );
}