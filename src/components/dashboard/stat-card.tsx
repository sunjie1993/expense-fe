"use client";

import {memo, type ReactNode} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {TrendingDown, TrendingUp} from "lucide-react";

interface StatCardProps {
    readonly title: string;
    readonly value: string;
    readonly change: number;
    readonly previousValue?: string;
    readonly icon: ReactNode;
    readonly period?: "monthly" | "yearly";
}

export const StatCard = memo(function StatCard({
    title,
    value,
    change,
    previousValue,
    icon,
    period,
}: StatCardProps) {
    const isIncrease = change > 0;
    const isNoChange = change === 0;
    const periodLabel = period === "yearly" ? "year" : "month";

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold truncate" title={value}>{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {isNoChange ? (
                        <span>No change vs last {periodLabel}</span>
                    ) : (
                        <>
                            {isIncrease
                                ? <TrendingUp className="h-3 w-3 text-red-500" aria-hidden="true"/>
                                : <TrendingDown className="h-3 w-3 text-green-500" aria-hidden="true"/>
                            }
                            <span className={isIncrease ? "text-red-500" : "text-green-500"}>
                                {Math.abs(change).toFixed(1)}%
                            </span>
                            <span>vs last {periodLabel}</span>
                            {previousValue && (
                                <span className="text-muted-foreground/60">({previousValue})</span>
                            )}
                        </>
                    )}
                </p>
            </CardContent>
        </Card>
    );
});
