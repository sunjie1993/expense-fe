"use client";

import {memo} from "react";
import {format} from "date-fns";
import {TableCell, TableRow} from "@/components/ui/table";
import {SpenderBadge} from "./spender-badge";
import {CategoryCell} from "./category-cell";
import {formatCurrency} from "@/lib/utils";
import type {Expense} from "@/types/api";

interface ExpenseTableRowProps {
    readonly expense: Expense;
}

export const ExpenseTableRow = memo(function ExpenseTableRow({expense}: ExpenseTableRowProps) {
    return (
        <TableRow>
            <TableCell>
                <span className="text-sm text-muted-foreground tabular-nums whitespace-nowrap">
                    {format(new Date(expense.expense_date), "d MMM yyyy")}
                </span>
            </TableCell>
            <TableCell>
                <CategoryCell
                    category={expense.category_name}
                    parentCategory={expense.parent_category_name}
                    icon={expense.main_cat_icon}
                    color={expense.main_cat_color}
                />
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">{expense.description || "—"}</span>
            </TableCell>
            <TableCell>
                <SpenderBadge spender={expense.spent_by}/>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{expense.payment_method}</span>
            </TableCell>
            <TableCell className="text-right">
                <span className="font-medium tabular-nums">{formatCurrency(expense.amount)}</span>
            </TableCell>
        </TableRow>
    );
});
