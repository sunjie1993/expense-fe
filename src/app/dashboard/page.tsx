"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { DollarSign, User, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PeriodToggle } from "@/components/dashboard/period-toggle";
import { StatCard } from "@/components/dashboard/stat-card";
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart";
import { CategoryRankingBoard } from "@/components/dashboard/category-ranking-board";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getCurrentYear() {
  return new Date().getFullYear().toString();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

function formatPeriodDisplay(period: "monthly" | "yearly", date: string) {
  if (period === "monthly") {
    const [year, month] = date.split("-");
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    return monthDate.toLocaleDateString("en-SG", {
      month: "long",
      year: "numeric",
    });
  } else {
    return date;
  }
}

function navigatePeriod(
  period: "monthly" | "yearly",
  currentDate: string,
  direction: "prev" | "next"
): string {
  if (period === "monthly") {
    const [year, month] = currentDate.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, "0");
    return `${newYear}-${newMonth}`;
  } else {
    const year = parseInt(currentDate);
    return (year + (direction === "next" ? 1 : -1)).toString();
  }
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [date, setDate] = useState(getCurrentMonth());

  // Update date when period changes
  const handlePeriodChange = (newPeriod: "monthly" | "yearly") => {
    setPeriod(newPeriod);
    setDate(newPeriod === "monthly" ? getCurrentMonth() : getCurrentYear());
  };

  const {
    data: dashboardData,
    error,
    isLoading,
  } = useDashboardOverview(period, date);

  const dashboard = dashboardData?.data;

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            {isLoading ? (
              "Loading..."
            ) : (
              <>Overview of your expenses for {formatPeriodDisplay(period, date)}</>
            )}
          </p>
        </div>
        <PeriodToggle period={period} onPeriodChange={handlePeriodChange} />
      </div>

      {/* Period Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(navigatePeriod(period, date, "prev"))}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium min-w-37.5 text-center">
          {formatPeriodDisplay(period, date)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDate(navigatePeriod(period, date, "next"))}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && dashboard && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Expenses"
              value={formatCurrency(dashboard.cards.total_expenses.current)}
              change={dashboard.cards.total_expenses.change_percentage}
              previousValue={formatCurrency(dashboard.cards.total_expenses.previous)}
              icon={<DollarSign className="h-4 w-4" />}
              iconColor="text-primary"
              iconBgColor="bg-primary/10"
            />

            {dashboard.cards.top_category ? (
              <StatCard
                title="Top Category"
                value={dashboard.cards.top_category.category_name}
                change={dashboard.cards.top_category.change_percentage}
                previousValue={formatCurrency(dashboard.cards.top_category.previous_total)}
                icon={
                  React.createElement(getCategoryIcon(dashboard.cards.top_category.icon), {
                    className: "h-4 w-4",
                  })
                }
                iconColor={dashboard.cards.top_category.color}
                iconBgColor={`${dashboard.cards.top_category.color}20`}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No category data
                  </p>
                </CardContent>
              </Card>
            )}

            {dashboard.cards.top_spender ? (
              <StatCard
                title="Top Spender"
                value={dashboard.cards.top_spender.spent_by}
                change={dashboard.cards.top_spender.change_percentage}
                previousValue={formatCurrency(dashboard.cards.top_spender.previous_total)}
                icon={<User className="h-4 w-4" />}
                iconColor="text-blue-500"
                iconBgColor="bg-blue-500/10"
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    No spender data
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Spending Trend Chart */}
          <SpendingTrendChart data={dashboard.spending_chart} period={period} />

          {/* Category Ranking */}
          <CategoryRankingBoard categories={dashboard.category_ranking} />
        </>
      )}
    </div>
  );
}