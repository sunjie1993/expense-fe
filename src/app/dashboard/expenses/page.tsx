"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/hooks/use-expenses";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/lib/category-icons";

function SpenderBadge({ spender }: Readonly<{ spender: string }>) {
  const styles: Record<string, string> = {
    SJ: "bg-lime-200 text-green-800",
    YS: "bg-fuchsia-300 text-fuchsia-900",
    Shared: "bg-blue-200 text-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        styles[spender] || "bg-gray-100 text-gray-700"
      )}
    >
      {spender}
    </span>
  );
}

function CategoryCell({
  category,
  parentCategory,
  icon,
  color
}: Readonly<{
  category: string;
  parentCategory: string;
  icon?: string;
  color?: string;
}>) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="p-2 rounded-lg"
        style={color ? { backgroundColor: `${color}20` } : undefined}
      >
        <CategoryIcon iconName={icon || "credit-card"} className="h-4 w-4" color={color} />
      </div>
      <div>
        <p className="font-medium text-sm">{category}</p>
        <p className="text-xs text-muted-foreground">{parentCategory}</p>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString("en-SG", { day: "numeric" }),
    monthYear: date.toLocaleDateString("en-SG", { month: "short", year: "numeric" }),
  };
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

export default function ExpensesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const offset = (currentPage - 1) * pageSize;
  const { data, error, isLoading } = useExpenses({ limit: pageSize, offset });

  const expenses = data?.data?.expenses || [];
  const pagination = data?.data?.pagination;

  const totalPages = pagination ? Math.ceil(pagination.total / pageSize) : 0;
  const hasNextPage = pagination?.has_more || false;
  const hasPrevPage = currentPage > 1;

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">
              Failed to load expenses. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
        <p className="text-muted-foreground">
          View and manage all your expenses
          {pagination && ` (${pagination.total} total)`}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && expenses.length > 0 && (
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
                {expenses.map((expense) => {
                  const { day, monthYear } = formatDate(expense.expense_date);
                  return (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="text-center">
                          <p className="text-lg font-semibold leading-none">{day}</p>
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
                        <span className="text-sm text-muted-foreground">
                          {expense.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <SpenderBadge spender={expense.spent_by} />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {expense.payment_method}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">
                          {formatAmount(expense.amount, expense.currency)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {!isLoading && expenses.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-12">
              No expenses found
            </p>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.total > pageSize && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + pageSize, pagination.total)} of {pagination.total} expenses
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!hasPrevPage || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm font-medium px-3">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!hasNextPage || isLoading}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
