"use client";

import {memo} from "react";
import {format} from "date-fns";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {CategoryIcon} from "@/lib/category-icons";
import {formatCurrency} from "@/lib/utils";
import {useExpenses} from "@/hooks/use-expenses";

export const RecentExpenses = memo(function RecentExpenses() {
    const {data, isLoading} = useExpenses({limit: 5, offset: 0});
    const expenses = data?.data?.expenses ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your 5 most recent expenses</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-9 w-9 rounded-full shrink-0"/>
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32"/>
                                    <Skeleton className="h-3 w-24"/>
                                </div>
                                <Skeleton className="h-4 w-16"/>
                            </div>
                        ))}
                    </div>
                ) : expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
                ) : (
                    <ul className="space-y-4">
                        {expenses.map((expense) => (
                            <li key={expense.id} className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                    style={expense.main_cat_color ? {backgroundColor: `${expense.main_cat_color}20`} : undefined}
                                    aria-hidden="true"
                                >
                                    <CategoryIcon
                                        iconName={expense.main_cat_icon ?? ""}
                                        className="h-4 w-4"
                                        color={expense.main_cat_color ?? ""}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">
                                        {expense.description || expense.category_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {format(new Date(expense.expense_date), "MMM d, yyyy")}
                                    </p>
                                </div>
                                <p className="text-sm font-medium tabular-nums shrink-0">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
});
