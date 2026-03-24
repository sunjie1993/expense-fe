"use client";

import {memo} from "react";
import {format} from "date-fns";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CategoryIconBadge} from "@/lib/category-icons";
import {SkeletonListItem} from "@/components/dashboard/dashboard-skeleton";
import {formatCurrency} from "@/lib/utils";
import {useExpenses} from "@/hooks/use-expenses";

export const RecentExpenses = memo(function RecentExpenses() {
    const {data, isLoading} = useExpenses({limit: 5, offset: 0});
    const expenses = data?.data?.expenses ?? [];

    let content;
    if (isLoading) {
        content = (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => <SkeletonListItem key={i}/>)}
            </div>
        );
    } else if (expenses.length === 0) {
        content = (
            <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
        );
    } else {
        content = (
            <ul className="space-y-4">
                {expenses.map((expense) => (
                    <li key={expense.id} className="flex items-center gap-3">
                        <CategoryIconBadge
                            iconName={expense.main_cat_icon ?? ""}
                            color={expense.main_cat_color}
                        />
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
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your 5 most recent expenses</CardDescription>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
});
