"use client";

import {memo, useMemo} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";
import {Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis} from "recharts";
import {useDailyTrend} from "@/hooks/use-dashboard";
import {formatCurrency} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";

interface DailyTrendChartProps {
    readonly yearMonth: string;
}

interface DailyChartPoint {
    day: number;
    total: number;
    count: number;
}

const chartConfig: ChartConfig = {
    total: {label: "Spending", color: "#3b82f6"},
};

const formatCompact = (value: number): string => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
};

export const DailyTrendChart = memo(function DailyTrendChart({yearMonth}: DailyTrendChartProps) {
    const {data, isLoading} = useDailyTrend(yearMonth);
    const trend = data?.data;

    const {chartData, peakDay} = useMemo((): { chartData: DailyChartPoint[]; peakDay: number | null } => {
        if (!trend?.days) return {chartData: [], peakDay: null};

        const items = trend.days.map((d) => ({
            day: Number(d.date.split("-")[2]),
            total: d.total,
            count: d.transaction_count,
        }));

        const peak = trend.peak_day
            ? Number(trend.peak_day.date.split("-")[2])
            : null;

        return {chartData: items, peakDay: peak};
    }, [trend]);

    const hasSpending = trend && trend.total > 0;

    const peakSuffix = peakDay && trend?.peak_day
        ? ` · Peak: day ${peakDay} (${formatCurrency(trend.peak_day.total)})`
        : "";
    const spendingDescription = hasSpending
        ? `Avg ${formatCurrency(trend.avg_per_day)}/active day${peakSuffix}`
        : "No spending this month";
    const description = isLoading ? "Loading..." : spendingDescription;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Spending</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && <Skeleton className="h-72 w-full"/>}

                {!isLoading && trend && hasSpending && (
                    <ChartContainer config={chartConfig} className="h-72 w-full">
                        <AreaChart data={chartData} accessibilityLayer>
                            <defs>
                                <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.02}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted"/>
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval={4}
                                tickFormatter={String}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={48}
                                tickFormatter={formatCompact}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(label) => `Day ${label}`}
                                        formatter={(value, _name, item) => {
                                            const {count} = item.payload as unknown as DailyChartPoint;
                                            return [
                                                <span key="v"
                                                      className="tabular-nums">{formatCurrency(Number(value))}</span>,
                                                <span key="c"
                                                      className="text-muted-foreground ml-1 text-xs">{count} txn{count === 1 ? "" : "s"}</span>,
                                            ];
                                        }}
                                    />
                                }
                            />
                            {trend.avg_per_day > 0 && (
                                <ReferenceLine
                                    y={trend.avg_per_day}
                                    stroke="var(--color-muted-foreground)"
                                    strokeDasharray="4 4"
                                    strokeOpacity={0.5}
                                    label={{
                                        value: "avg",
                                        position: "insideTopRight",
                                        fontSize: 10,
                                        fill: "var(--color-muted-foreground)",
                                    }}
                                />
                            )}
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="var(--color-total)"
                                strokeWidth={2}
                                fill="url(#dailyFill)"
                                dot={false}
                                activeDot={{r: 4, fill: "var(--color-total)"}}
                            />
                        </AreaChart>
                    </ChartContainer>
                )}

                {!isLoading && !hasSpending && (
                    <div className="flex h-72 items-center justify-center">
                        <p className="text-sm text-muted-foreground">No spending data for this month</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
