"use client";

import {memo, useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import type {ChartPeriod} from "@/types/api";

interface SpendingTrendChartProps {
    readonly data: ChartPeriod[];
    readonly period: "monthly" | "yearly";
}

type CategoryInfo = { id: number; name: string; color: string };

const getBarRadius = (index: number, total: number): [number, number, number, number] => {
    if (total === 1) return [4, 4, 4, 4];
    if (index === 0) return [0, 0, 4, 4];
    if (index === total - 1) return [4, 4, 0, 0];
    return [0, 0, 0, 0];
};

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
        categories.forEach((cat) => {
            config[`cat_${cat.id}`] = {label: cat.name, color: cat.color};
        });

        return {allCategories: categories, chartData: transformedData, chartConfig: config};
    }, [data]);

    const hasData = data.length > 0;
    const isMonthly = period === "monthly";

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isMonthly ? "Spending Trends" : "Yearly Overview"}</CardTitle>
                <CardDescription>
                    {hasData
                        ? `${isMonthly ? "Monthly" : "Yearly"} spending breakdown by category`
                        : "No spending data to display"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
                            <XAxis
                                dataKey="period"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    if (isMonthly) {
                                        const [, month] = String(value).split("-");
                                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                        return monthNames[Number(month) - 1];
                                    }
                                    return String(value);
                                }}
                            />
                            <ChartTooltip content={<ChartTooltipContent hideLabel/>} cursor={false}/>
                            <ChartLegend content={<ChartLegendContent/>}/>
                            {allCategories.map((cat, index) => (
                                <Bar
                                    key={cat.id}
                                    dataKey={`cat_${cat.id}`}
                                    stackId="a"
                                    fill={`var(--color-cat_${cat.id})`}
                                    radius={getBarRadius(index, allCategories.length)}
                                />
                            ))}
                        </BarChart>
                    </ChartContainer>
                ) : (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-sm text-muted-foreground">No spending data for this period</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
