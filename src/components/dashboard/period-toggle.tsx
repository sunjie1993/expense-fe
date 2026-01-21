"use client";

import { memo, useId, type KeyboardEvent } from "react";
import { Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "monthly" | "yearly";

interface PeriodToggleProps {
  readonly period: Period;
  readonly onPeriodChange: (period: Period) => void;
}

const PERIODS = [
  { value: "monthly" as const, label: "Monthly", icon: Calendar },
  { value: "yearly" as const, label: "Yearly", icon: CalendarDays },
];

export const PeriodToggle = memo(function PeriodToggle({
  period,
  onPeriodChange,
}: PeriodToggleProps) {
  const groupId = useId();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      onPeriodChange(period === "monthly" ? "yearly" : "monthly");
    }
  };

  return (
    <fieldset className="inline-flex items-center gap-1 rounded-xl bg-muted/50 p-1 backdrop-blur-sm border border-border/50 shadow-sm">
      <legend className="sr-only">Select period view</legend>
      {PERIODS.map(({ value, label, icon: Icon }) => {
        const isSelected = period === value;
        const inputId = `${groupId}-${value}`;
        return (
          <label
            key={value}
            htmlFor={inputId}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200",
              isSelected
                ? "bg-background text-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <input
              type="radio"
              id={inputId}
              name={groupId}
              value={value}
              checked={isSelected}
              onChange={() => onPeriodChange(value)}
              onKeyDown={handleKeyDown}
              className="sr-only"
            />
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isSelected && "scale-110"
              )}
              aria-hidden="true"
            />
            <span>{label}</span>
            {isSelected && (
              <span className="absolute inset-0 rounded-lg ring-1 ring-border/50 pointer-events-none" aria-hidden="true" />
            )}
          </label>
        );
      })}
    </fieldset>
  );
});