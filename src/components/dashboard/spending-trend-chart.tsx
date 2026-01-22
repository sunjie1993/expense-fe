"use client";

import {memo, useCallback, useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis, YAxis} from "recharts";
import type {ChartPeriod} from "@/types/api";
import {formatCurrency} from "@/lib/utils";

interface SpendingTrendChartProps {
    readonly data: ChartPeriod[];
    readonly period: "monthly" | "yearly";
}

type CategoryInfo = { id: number; name: string; color: string };

const formatChartCurrency = (amount: number) =>
    formatCurrency(amount, {minimumFractionDigits: 0, maximumFractionDigits: 0});

export const SpendingTrendChart = memo(function SpendingTrendChart({data, period}: SpendingTrendChartProps) {
    const {allCategories, chartData, chartConfig} = useMemo(() => {
        const categoryMap = new Map<number, { name: string; color: string }>();

        data.forEach((p) =>
            p.categories.forEach((cat) => {
                if (!categoryMap.has(cat.category_id)) {
                    categoryMap.set(cat.category_id, {name: cat.category_name, color: cat.color});
                }
            })
        );

        const categories: CategoryInfo[] = Array.from(categoryMap.entries()).map(([id, info]) => ({id, ...info}));

        const transformedData = data.map((p) => {
            const obj: Record<string, string | number> = {period: p.period, total: p.total};
            p.categories.forEach((cat) => (obj[`cat_${cat.category_id}`] = cat.amount));
            return obj;
        });

        const config: ChartConfig = {};
        categories.forEach((cat) => (config[`cat_${cat.id}`] = {label: cat.name, color: cat.color}));

        return {allCategories: categories, chartData: transformedData, chartConfig: config};
    }, [data]);

    const tooltipFormatter = useCallback(
        (value: number | string, name: string) => {
            const categoryId = name.replace("cat_", "");
            const category = allCategories.find((c) => c.id === Number.parseInt(categoryId, 10));
            return (
                <>
                    <span>{category?.name ?? name}</span>
                    <span className="ml-auto font-bold tabular-nums">{formatCurrency(value as number)}</span>
                </>
            );
        },
        [allCategories]
    );

    const hasData = data.length > 0;
    const isMonthly = period === "monthly";
    const periodLabel = isMonthly ? "Monthly" : "Yearly";
    const description = hasData ? `${periodLabel} spending breakdown by category` : "No spending data to display";

    return (
        <Card className="elevation-2 hover:elevation-4 transition-all duration-300">
            <CardHeader>
                <CardTitle>{isMonthly ? "Spending Trends" : "Yearly Overview"}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-87.5 w-full">
                        <BarChart data={chartData} accessibilityLayer barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted"/>
                            <XAxis
                                dataKey="period"
                                tickLine={false}
                                axisLine={false}
                                tick={{fontSize: 12}}
                                className="text-muted-foreground"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{fontSize: 12}}
                                tickFormatter={formatChartCurrency}
                                className="text-muted-foreground"
                            />
                            <ChartTooltip content={<ChartTooltipContent formatter={tooltipFormatter}/>}/>
                            {allCategories.map((cat) => (
                                <Bar
                                    key={cat.id}
                                    dataKey={`cat_${cat.id}`}
                                    stackId="a"
                                    fill={cat.color}
                                    radius={[4, 4, 0, 0]}
                                    className="transition-opacity hover:opacity-80"
                                />
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <svg className="h-8 w-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground text-center">
                            No spending data available for this period
                        </p>
                        <p className="text-xs text-muted-foreground text-center max-w-xs">
                            Your spending trends will appear here once you add expenses
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});