"use client";

import {AlertCircle, Loader2, Receipt} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

export function ExpenseLoadingState() {
    return (
        <output className="flex flex-col items-center justify-center py-20 space-y-4" aria-label="Loading expenses">
            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true"/>
            <p className="text-sm text-muted-foreground">Loading your expenses...</p>
        </output>
    );
}

export function ExpenseEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Receipt className="h-12 w-12 text-muted-foreground/40" aria-hidden="true"/>
            <div className="text-center space-y-1">
                <p className="text-sm font-medium text-muted-foreground">No expenses found</p>
                <p className="text-xs text-muted-foreground">Start tracking your expenses by adding your first transaction</p>
            </div>
        </div>
    );
}

export function ExpenseErrorState() {
    return (
        <div className="w-full p-6">
            <Card className="bg-destructive/5 border-destructive/20">
                <CardContent className="flex items-center justify-center gap-3 py-12">
                    <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true"/>
                    <div className="text-center">
                        <p className="text-sm font-medium text-destructive">Failed to load expenses</p>
                        <p className="text-xs text-muted-foreground mt-1">Please try again later or contact support if the problem persists.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}