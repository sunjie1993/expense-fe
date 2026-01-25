"use client";

import {useCallback, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useExpenses} from "@/hooks/use-expenses";
import {Receipt} from "lucide-react";
import {PaginationControls} from "@/components/expenses/pagination-controls";
import {ExpenseFilter, type ExpenseFilters} from "@/components/expenses/expense-filter";
import {ExpenseTableRow} from "@/components/expenses/expense-table-row";
import {ExpenseLoadingState, ExpenseEmptyState, ExpenseErrorState} from "@/components/expenses/expense-states";

const PAGE_SIZE = 10;

export default function ExpensesPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState<ExpenseFilters>({});

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

    const handlePageChange = useCallback((page: number) => setCurrentPage(page), []);

    const handleFiltersChange = useCallback((newFilters: ExpenseFilters) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    const getSubtitle = () => {
        if (isLoading) return "Loading your expenses...";
        const total = pagination ? ` (${pagination.total} total)` : "";
        return "View and manage all your expenses" + total;
    };

    if (error) return <ExpenseErrorState/>;

    return (
        <div className="w-full p-6 space-y-6 animate-in fade-in duration-500">
            <header className="space-y-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
                    <p className="text-sm text-muted-foreground">{getSubtitle()}</p>
                </div>
                <ExpenseFilter filters={filters} onFiltersChange={handleFiltersChange}/>
            </header>

            <Card className="overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" aria-hidden="true"/>
                        Recent Expenses
                    </CardTitle>
                    <CardDescription>
                        {hasExpenses ? "A detailed list of your recent transactions" : "Your expense history will appear here"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <ExpenseLoadingState/>}

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
                                    {expenses.map((expense) => (
                                        <ExpenseTableRow key={expense.id} expense={expense}/>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {!isLoading && !hasExpenses && <ExpenseEmptyState/>}

                    {!isLoading && pagination && pagination.total > PAGE_SIZE && (
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={pagination.total}
                            pageSize={PAGE_SIZE}
                            offset={offset}
                            hasNextPage={pagination.has_more}
                            hasPrevPage={currentPage > 1}
                            isLoading={isLoading}
                            onPageChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}