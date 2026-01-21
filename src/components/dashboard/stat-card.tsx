"use client";

import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

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

  const iconColorStyle = isHexColor(iconColor) ? { color: iconColor } : undefined;
  const iconBgStyle = isHexColor(iconBgColor)
      ? { backgroundColor: iconBgColor }
      : undefined;

  const trendColor = isIncrease ? "text-red-500" : "text-green-500";
  const trendIcon = isIncrease ? (
      <TrendingUp className="h-3 w-3 mr-1" aria-label="Increased" />
  ) : (
      <TrendingDown className="h-3 w-3 mr-1" aria-label="Decreased" />
  );

  return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div
              className={`h-10 w-10 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110 ${isHexColor(iconBgColor) ? "" : iconBgColor}`}
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
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          <div className="flex items-center gap-2 mt-2">
            {isNoChange ? (
                <div className="flex items-center text-muted-foreground">
                  <Minus className="h-3 w-3 mr-1" aria-label="No change" />
                  <span className="text-xs">No change</span>
                </div>
            ) : (
                <div className={`flex items-center ${trendColor}`}>
                  {trendIcon}
                  <output className="text-xs font-medium" aria-label={`${Math.abs(change).toFixed(1)}% ${isIncrease ? 'increase' : 'decrease'}`}>
                    {Math.abs(change).toFixed(1)}%
                  </output>
                </div>
            )}
            {previousValue && (
                <span className="text-xs text-muted-foreground">
              from {previousValue}
            </span>
            )}
          </div>
        </CardContent>
      </Card>
  );
});