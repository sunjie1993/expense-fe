"use client";

import type {ReactNode} from "react";
import {memo} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Minus, TrendingDown, TrendingUp} from "lucide-react";

interface StatCardProps {
    readonly title: string;
    readonly value: string;
    readonly change: number;
    readonly previousValue?: string;
    readonly icon: ReactNode;
    readonly iconColor?: string;
    readonly iconBgColor?: string;
}

/**
 * Check if a color string is a hex color
 * @param color - The color string to check
 * @returns True if the color is a hex color
 */
function isHexColor(color: string): boolean {
    return color.startsWith("#");
}

/**
 * StatCard component displays a stat with an icon, value, and trend indicator
 */
export const StatCard = memo(function StatCard({
                                                   title,
                                                   value,
                                                   change,
                                                   previousValue,
                                                   icon,
                                                   iconColor = "text-primary",
                                                   iconBgColor = "bg-primary/10",
                                               }: StatCardProps) {
    const isIncrease = change > 0;
    const isNoChange = change === 0;

    const iconColorStyle = isHexColor(iconColor) ? {color: iconColor} : undefined;
    const iconBgStyle = isHexColor(iconBgColor)
        ? {backgroundColor: iconBgColor}
        : undefined;

    const trendIcon = isIncrease ? (
        <TrendingUp className="h-3.5 w-3.5 mr-1.5" aria-label="Increased"/>
    ) : (
        <TrendingDown className="h-3.5 w-3.5 mr-1.5" aria-label="Decreased"/>
    );

    return (
        <Card className="elevation-2 hover:elevation-8 transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center transition-transform duration-200 hover:scale-110 ${isHexColor(iconBgColor) ? "" : iconBgColor}`}
                    style={iconBgStyle}
                    aria-hidden="true"
                >
                    <div
                        className={isHexColor(iconColor) ? "" : iconColor}
                        style={iconColorStyle}
                    >
                        {icon}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                    {value}
                </div>
                <div className="flex items-center gap-2 mt-3">
                    {isNoChange ? (
                        <div className="flex items-center text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
                            <Minus className="h-3.5 w-3.5 mr-1.5" aria-label="No change"/>
                            <span className="text-xs font-medium">No change</span>
                        </div>
                    ) : (
                        <div className={`flex items-center bg-muted/50 px-2.5 py-1 rounded-md ${
                            isIncrease
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                        }`}>
                            {trendIcon}
                            <output className="text-xs font-semibold"
                                    aria-label={`${Math.abs(change).toFixed(1)}% ${isIncrease ? 'increase' : 'decrease'}`}>
                                {Math.abs(change).toFixed(1)}%
                            </output>
                        </div>
                    )}
                    {previousValue && (
                        <span className="text-xs text-muted-foreground font-medium">
                            from {previousValue}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});