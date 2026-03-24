"use client";

import {memo} from "react";
import {cn} from "@/lib/utils";

interface SpenderBadgeProps {
    readonly spender: string;
}

const SPENDER_STYLES: Record<string, string> = {
    SJ: "bg-blue-50 text-blue-700 border-blue-200",
    YS: "bg-violet-50 text-violet-700 border-violet-200",
    Shared: "bg-muted text-muted-foreground border-border",
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
