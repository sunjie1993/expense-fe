"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboardSummary, useRecentExpenses } from "@/hooks/use-dashboard";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Loader2,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
} from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis } from "recharts";

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

function getDateRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    monthName: now.toLocaleDateString("en-SG", { month: "long", year: "numeric" }),
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
  }).format(amount);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";

  return date.toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  const { startDate, endDate, monthName } = useMemo(() => getDateRange(), []);

  const {
    data: summaryData,
    error: summaryError,
    isLoading: summaryLoading,
  } = useDashboardSummary(startDate, endDate);

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
  } = useRecentExpenses(5);

  const summary = summaryData?.data;
  const recentExpenses = recentData?.data?.expenses || [];

  const topCategory = summary?.category_breakdown?.[0];
  const transactionCount =
    summary?.category_breakdown?.reduce((acc, cat) => acc + cat.count, 0) || 0;
  const currentDay = new Date().getDate();
  const averageDaily = summary?.total_spent
    ? summary.total_spent / currentDay
    : 0;

  // Prepare chart data
  const pieChartData = useMemo(() => {
    if (!summary?.category_breakdown) return [];
    return summary.category_breakdown.map((cat) => ({
      name: cat.main_category_name,
      value: cat.total,
      fill: cat.color,
      percentage: cat.percentage,
    }));
  }, [summary]);

  const barChartData = useMemo(() => {
    if (!summary?.category_breakdown) return [];
    return summary.category_breakdown
      .slice(0, 5)
      .map((cat) => ({
        name: cat.main_category_name.length > 10
          ? cat.main_category_name.substring(0, 10) + "..."
          : cat.main_category_name,
        fullName: cat.main_category_name,
        total: cat.total,
        fill: cat.color,
      }));
  }, [summary]);

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    summary?.category_breakdown?.forEach((cat) => {
      config[cat.main_category_name] = {
        label: cat.main_category_name,
        color: cat.color,
      };
    });
    return config;
  }, [summary]);

  const isLoading = summaryLoading || recentLoading;
  const hasError = summaryError || recentError;

  if (hasError) {
    return (
      <div className="p-6">
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive text-center">
              Failed to load dashboard data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your expenses for {monthName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {summary ? formatCurrency(summary.total_spent) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{transactionCount}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
              {topCategory ? (
                (() => {
                  const Icon = categoryIcons[topCategory.main_category_name] || Receipt;
                  return <Icon className="h-4 w-4 text-orange-500" />;
                })()
              ) : (
                <Receipt className="h-4 w-4 text-orange-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {topCategory?.main_category_name || "-"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {topCategory ? `${topCategory.percentage}% of spending` : "No data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {averageDaily ? formatCurrency(averageDaily) : "$0.00"}
                </div>
                <p className="text-xs text-muted-foreground">Per day this month</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pieChartData.length ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => (
                          <div className="flex items-center justify-between gap-4">
                            <span>{name}</span>
                            <span className="font-bold">
                              {formatCurrency(value as number)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No expenses recorded
              </p>
            )}
            {/* Legend */}
            {pieChartData.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="truncate text-muted-foreground">{item.name}</span>
                    <span className="ml-auto font-medium">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : barChartData.length ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={barChartData} layout="vertical" margin={{ left: 0, right: 16 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, _, item) => (
                          <div className="flex items-center justify-between gap-4">
                            <span>{item.payload.fullName}</span>
                            <span className="font-bold">
                              {formatCurrency(value as number)}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No expenses recorded
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentExpenses.length ? (
            <div className="space-y-4">
              {recentExpenses.map((expense) => {
                const Icon = categoryIcons[expense.parent_category_name] || Receipt;
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {expense.description || expense.category_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category_name} &middot; {formatDate(expense.expense_date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">
                        -{formatCurrency(expense.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{expense.spent_by}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              No recent expenses
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
