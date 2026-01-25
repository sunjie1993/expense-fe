"use client";

import {useCallback, useMemo, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {useDashboardOverview} from "@/hooks/use-dashboard";
import {AlertCircle, ChevronLeft, ChevronRight, DollarSign, Loader2, User} from "lucide-react";
import {PeriodToggle} from "@/components/dashboard/period-toggle";
import {StatCard} from "@/components/dashboard/stat-card";
import {SpendingTrendChart} from "@/components/dashboard/spending-trend-chart";
import {CategoryRankingBoard} from "@/components/dashboard/category-ranking-board";
import {Button} from "@/components/ui/button";
import {CategoryIcon} from "@/lib/category-icons";
import {formatCurrency, formatPeriodDisplay, getCurrentMonth, getCurrentYear, navigatePeriod,} from "@/lib/utils";

export default function DashboardPage() {
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
    const [date, setDate] = useState(getCurrentMonth());

    const {data: dashboardData, error, isLoading} = useDashboardOverview(period, date);

    const dashboard = dashboardData?.data;

    const topCategoryIcon = useMemo(() => {
        if (!dashboard?.cards.top_category) return null;
        const {icon} = dashboard.cards.top_category;
        return <CategoryIcon iconName={icon} className="h-5 w-5"/>;
    }, [dashboard?.cards.top_category]);

    const handlePeriodChange = useCallback((newPeriod: "monthly" | "yearly") => {
        setPeriod(newPeriod);
        setDate(newPeriod === "monthly" ? getCurrentMonth() : getCurrentYear());
    }, []);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        setDate((prevDate) => navigatePeriod(period, prevDate, direction));
    }, [period]);

    if (error) {
        return (
            <div className="w-full p-6">
                <Card className="bg-destructive/5 border-destructive/20">
                    <CardContent className="flex items-center justify-center gap-3 py-12">
                        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true"/>
                        <div className="text-center">
                            <p className="text-sm font-medium text-destructive">
                                Failed to load dashboard data
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
        <div className="w-full p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        {isLoading
                            ? "Loading your expense overview..."
                            : `Overview of your expenses for ${formatPeriodDisplay(period, date)}`}
                    </p>
                </div>
                <PeriodToggle period={period} onPeriodChange={handlePeriodChange}/>
            </header>

            {/* Period Navigation */}
            <nav
                className="flex items-center justify-center gap-4"
                aria-label="Period navigation"
            >
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate("prev")}
                    disabled={isLoading}
                    aria-label="Previous period"
                >
                    <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true"/>
                    Previous
                </Button>
                <output className="text-sm font-medium min-w-40 text-center" aria-live="polite">
                    {formatPeriodDisplay(period, date)}
                </output>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate("next")}
                    disabled={isLoading}
                    aria-label="Next period"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true"/>
                </Button>
            </nav>

            {/* Loading State */}
            {isLoading && (
                <output className="flex flex-col items-center justify-center py-20 space-y-4"
                        aria-label="Loading dashboard data">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true"/>
                    <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
                </output>
            )}

            {/* Dashboard Content */}
            {!isLoading && dashboard && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Stats Cards */}
                    <section aria-label="Expense statistics">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Total Expenses"
                                value={formatCurrency(dashboard.cards.total_expenses.current)}
                                change={dashboard.cards.total_expenses.change_percentage}
                                previousValue={formatCurrency(dashboard.cards.total_expenses.previous)}
                                icon={<DollarSign className="h-5 w-5"/>}
                                iconColor="text-primary"
                                iconBgColor="bg-primary/10"
                            />

                            {dashboard.cards.top_category ? (
                                <StatCard
                                    title="Top Category"
                                    value={dashboard.cards.top_category.category_name}
                                    change={dashboard.cards.top_category.change_percentage}
                                    previousValue={formatCurrency(
                                        dashboard.cards.top_category.previous_total
                                    )}
                                    icon={topCategoryIcon}
                                    iconColor={dashboard.cards.top_category.color}
                                    iconBgColor={`${dashboard.cards.top_category.color}20`}
                                />
                            ) : (
                                <Card className="flex items-center justify-center">
                                    <CardContent className="py-8">
                                        <p className="text-sm text-muted-foreground text-center">
                                            No category data available
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {dashboard.cards.top_spender ? (
                                <StatCard
                                    title="Top Spender"
                                    value={dashboard.cards.top_spender.spent_by}
                                    change={dashboard.cards.top_spender.change_percentage}
                                    previousValue={formatCurrency(
                                        dashboard.cards.top_spender.previous_total
                                    )}
                                    icon={<User className="h-5 w-5"/>}
                                    iconColor="text-blue-500"
                                    iconBgColor="bg-blue-500/10"
                                />
                            ) : (
                                <Card className="flex items-center justify-center">
                                    <CardContent className="py-8">
                                        <p className="text-sm text-muted-foreground text-center">
                                            No spender data available
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </section>

                    {/* Spending Trend Chart */}
                    <section aria-label="Spending trends">
                        <SpendingTrendChart data={dashboard.spending_chart} period={period}/>
                    </section>

                    {/* Category Ranking */}
                    <section aria-label="Category rankings">
                        <CategoryRankingBoard categories={dashboard.category_ranking}/>
                    </section>
                </div>
            )}
        </div>
    );
}