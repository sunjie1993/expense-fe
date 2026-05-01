"use client";

import {cn} from "@/lib/utils";

function AvengersLogo({className, style}: Readonly<{ className?: string; style?: React.CSSProperties }>) {
    return (
        <svg
            viewBox="0 0 80 80"
            className={cn("text-primary", className)}
            style={style}
            aria-hidden="true"
        >
            {/* Stylised "A" — two diagonals + crossbar + top spike */}
            <line x1="40" y1="6" x2="8" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <line x1="40" y1="6" x2="72" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
            {/* Top cross-spike */}
            <line x1="40" y1="6" x2="40" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
    );
}

export function AvengersTransitionOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background animate-overlay-in">
            <div className="animate-hero-glow">
                <AvengersLogo
                    className="h-24 w-24 md:h-32 md:w-32 animate-shape-in"
                    style={{animationDelay: "0.2s"}}
                />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p
                    className="animate-shape-in text-primary text-xs tracking-[0.5em] uppercase font-(family-name:--font-heading)"
                    style={{animationDelay: "0.7s"}}
                >
                    Avengers
                </p>
                <p
                    className="animate-shape-in text-muted-foreground text-[10px] tracking-[0.3em] uppercase"
                    style={{animationDelay: "1s"}}
                >
                    Assemble
                </p>
            </div>
        </div>
    );
}
