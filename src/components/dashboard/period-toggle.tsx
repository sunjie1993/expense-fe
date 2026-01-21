"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";

interface PeriodToggleProps {
  readonly period: "monthly" | "yearly";
  readonly onPeriodChange: (period: "monthly" | "yearly") => void;
}

/**
 * PeriodToggle component for switching between monthly and yearly views
 */
export const PeriodToggle = memo(function PeriodToggle({
  period,
  onPeriodChange,
}: PeriodToggleProps) {
  const isMonthly = period === "monthly";
  const isYearly = period === "yearly";

  return (
    <div
      className="inline-flex items-center rounded-lg border bg-background p-1 shadow-sm"
      role="group"
      aria-label="Period selection"
    >
      <Button
        variant={isMonthly ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("monthly")}
        className="gap-2 transition-all"
        aria-pressed={isMonthly}
        aria-label="View monthly data"
      >
        <Calendar className="h-4 w-4" aria-hidden="true" />
        Monthly
      </Button>
      <Button
        variant={isYearly ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("yearly")}
        className="gap-2 transition-all"
        aria-pressed={isYearly}
        aria-label="View yearly data"
      >
        <CalendarDays className="h-4 w-4" aria-hidden="true" />
        Yearly
      </Button>
    </div>
  );
});