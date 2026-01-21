"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface SpenderBadgeProps {
  readonly spender: string;
}

const SPENDER_STYLES: Record<string, string> = {
  SJ: "bg-lime-200 text-green-800",
  YS: "bg-fuchsia-300 text-fuchsia-900",
  Shared: "bg-blue-200 text-blue-800",
} as const;

/**
 * SpenderBadge displays a colored badge indicating who made the expense
 */
export const SpenderBadge = memo(function SpenderBadge({
  spender,
}: SpenderBadgeProps) {
  const styleClass = SPENDER_STYLES[spender] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all hover:shadow-sm",
        styleClass
      )}
      role="status"
      aria-label={`Spent by ${spender}`}
    >
      {spender}
    </span>
  );
});