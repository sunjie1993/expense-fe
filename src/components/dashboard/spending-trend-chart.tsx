"use client";

import {memo, useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";
import {Bar, BarChart, CartesianGrid, XAxis} from "recharts";
import {TrendingUp} from "lucide-react";
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

function adjustColorVibrancy(color: string): string {
    if (!color.startsWith('#')) return color;

    const hex = color.replace('#', '');
    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);

    const enhancedR = Math.min(255, Math.round(r * 1.2));
    const enhancedG = Math.min(255, Math.round(g * 1.2));
    const enhancedB = Math.min(255, Math.round(b * 1.2));

    return `#${enhancedR.toString(16).padStart(2, '0')}${enhancedG.toString(16).padStart(2, '0')}${enhancedB.toString(16).padStart(2, '0')}`;
}

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
            const enhancedColor = adjustColorVibrancy(cat.color);
            config[`cat_${cat.id}`] = {label: cat.name, color: enhancedColor};
        });

        return {
            allCategories: categories,
            chartData: transformedData,
            chartConfig: config
        };
    }, [data]);

    const hasData = data.length > 0;
    const isMonthly = period === "monthly";
    const periodLabel = isMonthly ? "Monthly" : "Yearly";
    const description = hasData ? `${periodLabel} spending breakdown by category` : "No spending data to display";

    return (
        <Card className="glass-card glass-hover elevation-2 hover:elevation-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-linear-to-br from-chart-1/5 via-transparent to-chart-3/5 pointer-events-none" />
            <CardHeader className="relative z-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-chart-1 to-chart-3 flex items-center justify-center shadow-lg">
                        <TrendingUp className="h-5 w-5 text-white"/>
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-2xl font-bold tracking-tight">
                            {isMonthly ? "Spending Trends" : "Yearly Overview"}
                        </CardTitle>
                        <CardDescription className="mt-1">{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 relative z-10">
                {hasData ? (
                    <ChartContainer config={chartConfig} className="h-87.5 w-full">
                        <BarChart data={chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3}/>
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
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="glass-card backdrop-blur-xl border-white/20 shadow-xl"
                                        hideLabel
                                    />
                                }
                                cursor={false}
                            />
                            <ChartLegend content={<ChartLegendContent />} />
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
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <svg className="h-8 w-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
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