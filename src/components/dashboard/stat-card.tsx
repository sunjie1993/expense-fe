"use client";

import {type CSSProperties, memo, type ReactNode} from "react";
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

function isHexColor(color: string): boolean {
    return color.startsWith("#");
}

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

    const shadowColorStyle = isHexColor(iconColor)
        ? {'--shadow-color': `${iconColor}40`} as CSSProperties
        : undefined;

    const trendIcon = isIncrease ? (
        <TrendingUp className="h-3.5 w-3.5 mr-1.5" aria-label="Increased"/>
    ) : (
        <TrendingDown className="h-3.5 w-3.5 mr-1.5" aria-label="Decreased"/>
    );

    return (
        <Card
            className="glass-card glass-hover elevation-2 hover:elevation-8 glow-border shadow-colored overflow-hidden relative"
            style={shadowColorStyle}
        >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {title}
                </CardTitle>
                <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-lg ${isHexColor(iconBgColor) ? "" : iconBgColor}`}
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
            <CardContent className="relative z-10">
                <div className="text-3xl font-bold tracking-tight text-foreground animate-counter mb-1">
                    {value}
                </div>
                <div className="flex items-center gap-2 mt-3">
                    {isNoChange ? (
                        <div className="flex items-center text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
                            <Minus className="h-3.5 w-3.5 mr-1.5" aria-label="No change"/>
                            <span className="text-xs font-medium">No change</span>
                        </div>
                    ) : (
                        <div className={`flex items-center px-2.5 py-1.5 rounded-lg backdrop-blur-sm shadow-sm ${
                            isIncrease
                                ? 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20'
                                : 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20'
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