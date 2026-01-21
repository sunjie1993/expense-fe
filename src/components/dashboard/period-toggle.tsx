"use client";

import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";

interface PeriodToggleProps {
  period: "monthly" | "yearly";
  onPeriodChange: (period: "monthly" | "yearly") => void;
}

export function PeriodToggle({ period, onPeriodChange }: PeriodToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg border bg-background p-1">
      <Button
        variant={period === "monthly" ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("monthly")}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Monthly
      </Button>
      <Button
        variant={period === "yearly" ? "default" : "ghost"}
        size="sm"
        onClick={() => onPeriodChange("yearly")}
        className="gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        Yearly
      </Button>
    </div>
  );
}