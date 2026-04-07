"use client";

import {memo} from "react";
import {cn} from "@/lib/utils";

interface SpenderBadgeProps {
    readonly spender: string;
}

const SPENDER_STYLES: Record<string, string> = {
    SJ: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    YS: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    Shared: "bg-amber-500/15 text-amber-300 border-amber-500/30",
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
