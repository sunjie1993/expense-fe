"use client";

import {memo} from "react";
import {TableCell, TableRow} from "@/components/ui/table";
import {SpenderBadge} from "./spender-badge";
import {CategoryCell} from "./category-cell";
import {formatCurrency, formatExpenseDate} from "@/lib/utils";
import type {Expense} from "@/types/api";

interface ExpenseTableRowProps {
    readonly expense: Expense;
}

export const ExpenseTableRow = memo(function ExpenseTableRow({expense}: ExpenseTableRowProps) {
    const {day, monthYear} = formatExpenseDate(expense.expense_date);

    return (
        <TableRow className="animate-in fade-in slide-in-from-bottom-2 expense-row-animation">
            <TableCell>
                <div className="text-center">
                    <p className="text-lg font-semibold leading-none tabular-nums">{day}</p>
                    <p className="text-xs text-muted-foreground mt-1">{monthYear}</p>
                </div>
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
                <span className="text-sm text-muted-foreground">{expense.description || "-"}</span>
            </TableCell>
            <TableCell>
                <SpenderBadge spender={expense.spent_by}/>
            </TableCell>
            <TableCell>
                <span className="text-sm text-muted-foreground">{expense.payment_method}</span>
            </TableCell>
            <TableCell className="text-right">
                <span className="font-semibold tabular-nums">{formatCurrency(expense.amount)}</span>
            </TableCell>
        </TableRow>
    );
});