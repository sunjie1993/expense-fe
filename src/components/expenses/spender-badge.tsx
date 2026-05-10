"use client";

import {memo} from "react";
import {cn} from "@/lib/utils";

interface SpenderBadgeProps {
    readonly spender: string;
}

const SPENDER_STYLES: Record<string, string> = {
    SJ: "bg-pink-50 text-pink-600 border-pink-200",
    YS: "bg-cyan-50 text-cyan-700 border-cyan-200",
    Shared: "bg-amber-50 text-amber-700 border-amber-200",
};

export const SpenderBadge = memo(function SpenderBadge({spender}: SpenderBadgeProps) {
    const styleClass = SPENDER_STYLES[spender] ?? "bg-muted text-muted-foreground border-border";

    return (
        <output
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                styleClass
            )}
            aria-label={`Spent by ${spender}`}
        >
            {spender}
        </output>
    );
});
