"use client";

import {useCallback, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useExpenses} from "@/hooks/use-expenses";
import {Receipt} from "lucide-react";
import {PageHeader} from "@/components/dashboard/page-header";
import {PaginationControls} from "@/components/expenses/pagination-controls";
import {ExpenseFilter, type ExpenseFilters} from "@/components/expenses/expense-filter";
import {ExpenseCard, ExpenseTableRow} from "@/components/expenses/expense-table-row";
import {ExpenseEmptyState, ExpenseErrorState, ExpenseLoadingState} from "@/components/expenses/expense-states";

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

    if (error) return <ExpenseErrorState/>;

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

                        {!isLoading && hasExpenses && (
                            <>
                                {/* Mobile card list */}
                                <div className="sm:hidden">
                                    {expenses.map((expense) => (
                                        <ExpenseCard key={expense.id} expense={expense}/>
                                    ))}
                                </div>

                                {/* Desktop table */}
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
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {expenses.map((expense) => (
                                                <ExpenseTableRow key={expense.id} expense={expense}/>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
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
        </div>
    );
}
