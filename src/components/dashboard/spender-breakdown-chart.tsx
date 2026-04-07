"use client";

import {memo, useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";
import {Pie, PieChart} from "recharts";
import {useSpenderBreakdown} from "@/hooks/use-dashboard";
import {formatCurrency} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";
import {TrendingDown, TrendingUp} from "lucide-react";

const SPENDER_COLORS: Record<string, string> = {
    SJ: "#e8185a",    /* hot magenta */
    YS: "#0fb8c9",    /* teal */
    Shared: "#d4a017", /* dalgona gold */
};

interface SpenderBreakdownChartProps {
    readonly period: "monthly" | "yearly";
    readonly date: string;
}

export const SpenderBreakdownChart = memo(function SpenderBreakdownChart({
                                                                             period,
                                                                             date,
                                                                         }: SpenderBreakdownChartProps) {
    const {data, isLoading} = useSpenderBreakdown(period, date);
    const breakdown = data?.data;

    const {chartData, chartConfig} = useMemo(() => {
        if (!breakdown?.spenders?.length) return {chartData: [], chartConfig: {} as ChartConfig};

        const config: ChartConfig = {};
        const items = breakdown.spenders
            .filter((s) => s.total > 0)
            .map((s) => {
                const color = SPENDER_COLORS[s.spent_by] ?? "#94a3b8";
                config[s.spent_by] = {label: s.spent_by, color};
                return {name: s.spent_by, value: s.total, fill: color};
            });

        return {chartData: items, chartConfig: config};
    }, [breakdown]);

    const periodLabel = period === "yearly" ? "year" : "month";
    const hasData = chartData.length > 0;
    const spendingDescription = hasData ? `Who spent what this ${periodLabel}` : "No spending data this period";
    const description = isLoading ? "Loading..." : spendingDescription;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Spender Breakdown</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-60 w-full"/>}

                {!isLoading && breakdown && chartData.length > 0 && (
                    <>
                        <ChartContainer config={chartConfig} className="h-44 w-full">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={3}
                                />
                                <ChartTooltip
                                    content={
                                        <ChartTooltipContent
                                            hideLabel
                                            formatter={(value) => formatCurrency(Number(value))}
                                        />
                                    }
                                />
                            </PieChart>
                        </ChartContainer>

                        <ul className="mt-3 space-y-3">
                            {breakdown.spenders.map((s) => {
                                const color = SPENDER_COLORS[s.spent_by] ?? "#94a3b8";
                                const isUp = s.change_percentage > 0;
                                return (
                                    <li key={s.spent_by} className="flex items-center gap-3">
                                        <span
                                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                                            style={{backgroundColor: color}}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{s.spent_by}</span>
                                                <span className="text-sm font-medium tabular-nums">
                                                    {formatCurrency(s.total)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {s.transaction_count} txn{s.transaction_count === 1 ? "" : "s"} · {s.percentage.toFixed(1)}%
                                                </span>
                                                {s.change_percentage !== 0 && (
                                                    <span
                                                        className={`flex items-center gap-0.5 text-xs ${isUp ? "text-red-500" : "text-green-500"}`}>
                                                        {isUp
                                                            ? <TrendingUp className="h-3 w-3"/>
                                                            : <TrendingDown className="h-3 w-3"/>
                                                        }
                                                        {Math.abs(s.change_percentage).toFixed(1)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {!isLoading && chartData.length === 0 && (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">No spending data for this period</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
