"use client";

import {Receipt} from "lucide-react";
import {ErrorCard} from "@/components/ui/error-card";
import {Skeleton} from "@/components/ui/skeleton";

export function ExpenseLoadingState() {
    return (
        <div className="space-y-3" aria-label="Loading expenses">
            {["r1", "r2", "r3", "r4", "r5", "r6"].map((row) => (
                <div key={row} className="flex items-center gap-4 py-2">
                    <Skeleton className="h-4 w-12 shrink-0"/>
                    <Skeleton className="h-4 w-32"/>
                    <Skeleton className="h-4 flex-1"/>
                    <Skeleton className="h-4 w-16"/>
                    <Skeleton className="h-4 w-20"/>
                    <Skeleton className="h-4 w-16 ml-auto"/>
                </div>
            ))}
        </div>
    );
}

export function ExpenseEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Receipt className="h-10 w-10 text-muted-foreground/40" aria-hidden="true"/>
            <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">No expenses found</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first expense to get started</p>
            </div>
        </div>
    );
}

export function ExpenseErrorState() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <ErrorCard title="Failed to load expenses"/>
        </div>
    );
}
