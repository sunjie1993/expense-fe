"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useExpenses } from "@/hooks/use-expenses";
import { Loader2, Utensils, Car, ShoppingBag, Gamepad2, Receipt, Heart, GraduationCap, Plane } from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  "Food & Dining": Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Gamepad2,
  "Bills & Utilities": Receipt,
  Healthcare: Heart,
  Education: GraduationCap,
  Travel: Plane,
};

const categoryColors: Record<string, string> = {
  "Food & Dining": "text-red-500 bg-red-50 dark:bg-red-950",
  Transport: "text-teal-500 bg-teal-50 dark:bg-teal-950",
  Shopping: "text-pink-500 bg-pink-50 dark:bg-pink-950",
  Entertainment: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950",
  "Bills & Utilities": "text-orange-500 bg-orange-50 dark:bg-orange-950",
  Healthcare: "text-rose-500 bg-rose-50 dark:bg-rose-950",
  Education: "text-violet-500 bg-violet-50 dark:bg-violet-950",
  Travel: "text-sky-500 bg-sky-50 dark:bg-sky-950",
};

function SpenderBadge({ spender }: { spender: string }) {
  const styles: Record<string, string> = {
    SJ: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    YS: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    Shared: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
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

function CategoryCell({ category, parentCategory }: { category: string; parentCategory: string }) {
  const Icon = categoryIcons[parentCategory] || Receipt;
  const colorClass = categoryColors[parentCategory] || "text-gray-500 bg-gray-50 dark:bg-gray-900";

  return (
    <div className="flex items-center gap-3">
      <div className={cn("p-2 rounded-lg", colorClass)}>
        <Icon className="h-4 w-4" />
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
  const { data, error, isLoading } = useExpenses({ limit: 50 });

  const expenses = data?.data?.expenses || [];
  const pagination = data?.data?.pagination;

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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : expenses.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
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
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              No expenses found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
