"use client";

import {memo} from "react";
import {format} from "date-fns";
import {MoreHorizontal, Pencil, Trash2} from "lucide-react";
import {TableCell, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {SpenderBadge} from "./spender-badge";
import {CategoryCell} from "./category-cell";
import {formatCurrency} from "@/lib/utils";
import type {Expense} from "@/types/api";

interface ExpenseTableRowProps {
    readonly expense: Expense;
    readonly onEdit: (expense: Expense) => void;
    readonly onDelete: (expense: Expense) => void;
}

export const ExpenseTableRow = memo(function ExpenseTableRow({expense, onEdit, onDelete}: ExpenseTableRowProps) {
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
                <span className="text-base font-semibold tabular-nums text-primary">
                    {formatCurrency(expense.amount)}
                </span>
            </TableCell>
            <TableCell className="w-10 pl-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Expense actions">
                            <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(expense)}>
                            <Pencil className="mr-2 h-4 w-4"/>
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(expense)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4"/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
});

export const ExpenseCard = memo(function ExpenseCard({expense, onEdit, onDelete}: ExpenseTableRowProps) {
    return (
        <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
            <CategoryCell
                category={expense.category_name}
                parentCategory={expense.parent_category_name}
                icon={expense.main_cat_icon}
                color={expense.main_cat_color}
            />
            <div className="ml-auto flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-base font-semibold tabular-nums text-primary">
                    {formatCurrency(expense.amount)}
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {format(new Date(expense.expense_date), "d MMM yyyy")}
                    </span>
                    <SpenderBadge spender={expense.spent_by}/>
                </div>
                {expense.description && (
                    <span className="text-xs text-muted-foreground text-right max-w-40 truncate">
                        {expense.description}
                    </span>
                )}
                <div className="flex items-center gap-0.5 mt-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        aria-label="Edit expense"
                        onClick={() => onEdit(expense)}
                    >
                        <Pencil className="h-3.5 w-3.5"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        aria-label="Delete expense"
                        onClick={() => onDelete(expense)}
                    >
                        <Trash2 className="h-3.5 w-3.5"/>
                    </Button>
                </div>
            </div>
        </div>
    );
});
