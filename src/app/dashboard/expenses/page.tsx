"use client";

import {useCallback, useState} from "react";
import {useSWRConfig} from "swr";
import {toast} from "sonner";
import {Loader2, Receipt} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useExpenses} from "@/hooks/use-expenses";
import {apiDelete, isExpenseKey} from "@/lib/api";
import {formatCurrency} from "@/lib/utils";
import {PageHeader} from "@/components/dashboard/page-header";
import {PaginationControls} from "@/components/expenses/pagination-controls";
import {ExpenseFilter, type ExpenseFilters} from "@/components/expenses/expense-filter";
import {ExpenseCard, ExpenseTableRow} from "@/components/expenses/expense-table-row";
import {ExpenseEmptyState, ExpenseErrorState, ExpenseLoadingState} from "@/components/expenses/expense-states";
import {ExpenseFormDialog} from "@/components/expenses/expense-form-dialog";
import type {Expense} from "@/types/api";

const PAGE_SIZE = 10;

export default function ExpensesPage() {
    const {mutate} = useSWRConfig();
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ExpenseFilters>({});
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const offset = (currentPage - 1) * PAGE_SIZE;
    const {data, error, isLoading} = useExpenses({
        limit: PAGE_SIZE,
        offset,
        spentBy: filters.spentBy,
        startDate: filters.startDate,
        endDate: filters.endDate,
    });

    const expenses = data?.data?.expenses ?? [];
    const pagination = data?.data?.pagination;
    const totalPages = pagination ? Math.ceil(pagination.total / PAGE_SIZE) : 0;
    const hasExpenses = expenses.length > 0;

    const handleFiltersChange = useCallback((newFilters: ExpenseFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!deletingExpense) return;
        setIsDeleting(true);
        try {
            await apiDelete(`/api/expenses/${deletingExpense.id}`);
            await mutate(isExpenseKey);
            toast.success("Expense deleted");
            setDeletingExpense(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to delete expense";
            toast.error("Failed to delete expense", {description: message});
        } finally {
            setIsDeleting(false);
        }
    }, [deletingExpense, mutate]);

    let headerDescription: string;
    if (isLoading) {
        headerDescription = "Loading your expenses...";
    } else if (pagination) {
        headerDescription = `${pagination.total} total expenses`;
    } else {
        headerDescription = "View and manage all your expenses";
    }

    return (
        <div className="flex flex-1 flex-col">
            <PageHeader
                title="Expenses"
                description={headerDescription}
            >
                <ExpenseFilter filters={filters} onFiltersChange={handleFiltersChange}/>
            </PageHeader>

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Receipt className="h-4 w-4" aria-hidden="true"/>
                            Transactions
                        </CardTitle>
                        <CardDescription>
                            {hasExpenses
                                ? "A detailed list of your recent transactions"
                                : "Your expense history will appear here"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <ExpenseLoadingState/>}

                        {!isLoading && error && <ExpenseErrorState/>}

                        {!isLoading && !error && hasExpenses && (
                            <>
                                <div className="sm:hidden">
                                    {expenses.map((expense) => (
                                        <ExpenseCard
                                            key={expense.id}
                                            expense={expense}
                                        />
                                    ))}
                                </div>

                                <div className="hidden sm:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-25">Date</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead>Spent By</TableHead>
                                                <TableHead className="hidden md:table-cell">Payment</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                                <TableHead className="w-10"/>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenses.map((expense) => (
                                                <ExpenseTableRow
                                                    key={expense.id}
                                                    expense={expense}
                                                    onEdit={setEditingExpense}
                                                    onDelete={setDeletingExpense}
                                                />
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}

                        {!isLoading && !error && !hasExpenses && <ExpenseEmptyState/>}

                        {!isLoading && !error && pagination && totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={pagination.total}
                                pageSize={PAGE_SIZE}
                                offset={offset}
                                hasNextPage={pagination.has_more}
                                hasPrevPage={currentPage > 1}
                                isLoading={isLoading}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            <ExpenseFormDialog
                expense={editingExpense}
                open={!!editingExpense}
                onOpenChange={(open) => { if (!open) setEditingExpense(null); }}
            />

            <Dialog
                open={!!deletingExpense}
                onOpenChange={(open) => { if (!open && !isDeleting) setDeletingExpense(null); }}
            >
                <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Delete Expense</DialogTitle>
                    </DialogHeader>
                    {deletingExpense && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                {"Are you sure you want to delete the "}
                                <span className="font-medium text-foreground">{formatCurrency(deletingExpense.amount)}</span>
                                {" expense from "}
                                <span className="font-medium text-foreground">{deletingExpense.category_name}</span>
                                {"? This cannot be undone."}
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDeletingExpense(null)}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    aria-label={isDeleting ? "Deleting expense" : "Confirm delete"}
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true"/>
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
