"use client";

import { useMemo } from "react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import type { ChartPeriod } from "@/types/api";

interface SpendingTrendChartProps {
  data: ChartPeriod[];
  period: "monthly" | "yearly";
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SpendingTrendChart({ data, period }: SpendingTrendChartProps) {
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

  const title = period === "monthly" ? "Last 6 Months" : "Last 3 Years";
  const description =
    period === "monthly"
      ? "Monthly spending breakdown by category"
      : "Yearly spending breakdown by category";

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No spending data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const categoryId = name.toString().replace("cat_", "");
                    const category = allCategories.find(
                      (c) => c.id === parseInt(categoryId)
                    );
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span>{category?.name || name}</span>
                        <span className="font-bold">
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
                radius={0}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}