"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  previousValue?: string;
  icon: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

export function StatCard({
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

  // Check if color is a hex color or a Tailwind class
  const isHexColor = (color: string) => color.startsWith('#');

  const iconColorStyle = isHexColor(iconColor) ? { color: iconColor } : undefined;
  const iconBgStyle = isHexColor(iconBgColor) ? { backgroundColor: iconBgColor } : undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${!isHexColor(iconBgColor) ? iconBgColor : ''}`}
          style={iconBgStyle}
        >
          <div className={!isHexColor(iconColor) ? iconColor : ''} style={iconColorStyle}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {isNoChange ? (
            <div className="flex items-center text-muted-foreground">
              <Minus className="h-3 w-3 mr-1" />
              <span className="text-xs">No change</span>
            </div>
          ) : (
            <div
              className={`flex items-center ${
                isIncrease ? "text-red-500" : "text-green-500"
              }`}
            >
              {isIncrease ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              <span className="text-xs font-medium">
                {Math.abs(change).toFixed(1)}%
              </span>
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
}