"use client";

import { useMemo, memo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { ChartPeriod } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

interface SpendingTrendChartProps {
  readonly data: ChartPeriod[];
  readonly period: "monthly" | "yearly";
}

/**
 * Format currency for chart display (abbreviated)
 * @param amount - The amount to format
 * @returns Formatted currency string without decimals
 */
function formatChartCurrency(amount: number): string {
  return formatCurrency(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

/**
 * SpendingTrendChart displays spending trends over time with category breakdown
 */
export const SpendingTrendChart = memo(function SpendingTrendChart({
  data,
  period,
}: SpendingTrendChartProps) {
  // Collect all unique categories
  const allCategories = useMemo(() => {
    const categoryMap = new Map<number, { name: string; color: string }>();
    data.forEach((periodData) => {
      periodData.categories.forEach((cat) => {
        if (!categoryMap.has(cat.category_id)) {
          categoryMap.set(cat.category_id, {
            name: cat.category_name,
            color: cat.color,
          });
        }
      });
    });
    return Array.from(categoryMap.entries()).map(([id, info]) => ({
      id,
      ...info,
    }));
  }, [data]);

  // Transform data for stacked bar chart
  const chartData = useMemo(() => {
    return data.map((periodData) => {
      const periodObj: Record<string, string | number> = {
        period: periodData.period,
        total: periodData.total,
      };

      // Add each category as a field
      periodData.categories.forEach((cat) => {
        periodObj[`cat_${cat.category_id}`] = cat.amount;
      });

      return periodObj;
    });
  }, [data]);

  // Create chart config
  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    allCategories.forEach((cat) => {
      config[`cat_${cat.id}`] = {
        label: cat.name,
        color: cat.color,
      };
    });
    return config;
  }, [allCategories]);

  const title = period === "monthly" ? "Spending Trends" : "Yearly Overview";
  const description =
    period === "monthly"
      ? "Monthly spending breakdown by category"
      : "Yearly spending breakdown by category";

  const hasData = data && data.length > 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {hasData ? description : "No spending data to display"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              No spending data available for this period
            </p>
            <p className="text-xs text-muted-foreground text-center">
              Your spending trends will appear here once you add expenses
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-87.5 w-full">
            <BarChart data={chartData} accessibilityLayer>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-muted"
              />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatChartCurrency(value)}
                className="text-muted-foreground"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const categoryId = name.toString().replaceAll("cat_", "");
                      const category = allCategories.find(
                        (c) => c.id === Number.parseInt(categoryId, 10)
                      );
                      return (
                        <div className="flex items-center justify-between gap-4">
                          <span>{category?.name || name}</span>
                          <span className="font-bold tabular-nums">
                            {formatCurrency(value as number)}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              {allCategories.map((cat) => (
                <Bar
                  key={cat.id}
                  dataKey={`cat_${cat.id}`}
                  stackId="a"
                  fill={cat.color}
                  radius={[0, 0, 0, 0]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
});