"use client";

import {memo} from "react";
import {format} from "date-fns";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {CategoryIconBadge} from "@/lib/category-icons";
import {SpenderBadge} from "@/components/expenses/spender-badge";
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
                {["a", "b", "c", "d", "e"].map((k) => <SkeletonListItem key={k}/>)}
            </div>
        );
    } else if (expenses.length === 0) {
        content = (
            <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
        );
    } else {
        content = (
            <ul className="space-y-1">
                {expenses.map((expense) => (
                    <li key={expense.id}>
                        <Link
                            href="/dashboard/expenses"
                            className="flex items-center gap-3 rounded-md -mx-2 px-2 py-2 transition-colors hover:bg-muted/50"
                        >
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
                            <div className="flex items-center gap-2 shrink-0">
                                <SpenderBadge spender={expense.spent_by}/>
                                <p className="text-sm font-medium tabular-nums">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription className="mt-1">Your 5 most recent expenses</CardDescription>
                </div>
                <Link
                    href="/dashboard/expenses"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors pt-0.5"
                >
                    View all →
                </Link>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    );
});
