"use client";

import {useCallback, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {useExpenses} from "@/hooks/use-expenses";
import {AlertCircle, Loader2, Receipt} from "lucide-react";
import {SpenderBadge} from "@/components/expenses/spender-badge";
import {CategoryCell} from "@/components/expenses/category-cell";
import {PaginationControls} from "@/components/expenses/pagination-controls";
import {formatCurrency, formatExpenseDate} from "@/lib/utils";

const PAGE_SIZE = 10;

export default function ExpensesPage() {
    const [currentPage, setCurrentPage] = useState(1);

    const offset = (currentPage - 1) * PAGE_SIZE;
    const {data, error, isLoading} = useExpenses({limit: PAGE_SIZE, offset});

    const expenses = data?.data?.expenses || [];
    const pagination = data?.data?.pagination;

    const totalPages = pagination ? Math.ceil(pagination.total / PAGE_SIZE) : 0;
    const hasNextPage = pagination?.has_more || false;
    const hasPrevPage = currentPage > 1;
    const hasExpenses = expenses.length > 0;

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    // Format subtitle text without nested template literals
    const getSubtitleText = () => {
        if (isLoading) {
            return "Loading your expenses...";
        }

        if (pagination) {
            return `View and manage all your expenses (${pagination.total} total)`;
        }

        return "View and manage all your expenses";
    };

    // Error State
    if (error) {
        return (
            <div className="container mx-auto p-6 max-w-7xl">
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="flex items-center justify-center gap-3 py-12">
                        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true"/>
                        <div className="text-center">
                            <p className="text-sm font-medium text-destructive">
                                Failed to load expenses
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Please try again later or contact support if the problem persists.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-7xl animate-in fade-in duration-500">
            {/* Header */}
            <header className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                <p className="text-sm text-muted-foreground">
                    {getSubtitleText()}
                </p>
            </header>

            {/* Main Content Card */}
            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" aria-hidden="true"/>
                        Recent Expenses
                    </CardTitle>
                    <CardDescription>
                        {hasExpenses
                            ? "A detailed list of your recent transactions"
                            : "Your expense history will appear here"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Loading State */}
                    {isLoading && (
                        <output
                            className="flex flex-col items-center justify-center py-20 space-y-4"
                            aria-label="Loading expenses"
                        >
                            <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true"/>
                            <p className="text-sm text-muted-foreground">Loading your expenses...</p>
                        </output>
                    )}

                    {/* Expense Table */}
                    {!isLoading && hasExpenses && (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-25">Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Spent By</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((expense, index) => {
                                        const {day, monthYear} = formatExpenseDate(expense.expense_date);
                                        return (
                                            <TableRow
                                                key={expense.id}
                                                className="animate-in fade-in slide-in-from-bottom-2"
                                                style={{
                                                    animationDelay: `${index * 30}ms`,
                                                    animationFillMode: "backwards",
                                                }}
                                            >
                                                <TableCell>
                                                    <div className="text-center">
                                                        <p className="text-lg font-semibold leading-none tabular-nums">
                                                            {day}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {monthYear}
                                                        </p>
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
                          <span className="text-sm text-muted-foreground">
                            {expense.description || "-"}
                          </span>
                                                </TableCell>
                                                <TableCell>
                                                    <SpenderBadge spender={expense.spent_by}/>
                                                </TableCell>
                                                <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {expense.payment_method}
                          </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(expense.amount)}
                          </span>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && !hasExpenses && (
                        <div className="flex flex-col items-center justify-center py-20 space-y-3">
                            <Receipt
                                className="h-12 w-12 text-muted-foreground/40"
                                aria-hidden="true"
                            />
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">
                                    No expenses found
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Start tracking your expenses by adding your first transaction
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!isLoading && pagination && pagination.total > PAGE_SIZE && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={pagination.total}
                            pageSize={PAGE_SIZE}
                            offset={offset}
                            hasNextPage={hasNextPage}
                            hasPrevPage={hasPrevPage}
                            isLoading={isLoading}
                            onPageChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}