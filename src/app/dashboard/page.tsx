"use client";

import {useCallback, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {useDashboardOverview} from "@/hooks/use-dashboard";
import {AlertCircle, ChevronLeft, ChevronRight, DollarSign, User} from "lucide-react";
import {PeriodToggle} from "@/components/dashboard/period-toggle";
import {StatCard} from "@/components/dashboard/stat-card";
import {SpendingTrendChart} from "@/components/dashboard/spending-trend-chart";
import {CategoryRankingBoard} from "@/components/dashboard/category-ranking-board";
import {DashboardSkeleton} from "@/components/dashboard/dashboard-skeleton";
import {RecentExpenses} from "@/components/dashboard/recent-expenses";
import {Button} from "@/components/ui/button";
import {CategoryIcon} from "@/lib/category-icons";
import {formatCurrency, formatPeriodDisplay, getCurrentMonth, getCurrentYear, navigatePeriod} from "@/lib/utils";

export default function DashboardPage() {
    const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
    const [date, setDate] = useState(getCurrentMonth());

    const {data: dashboardData, error, isLoading} = useDashboardOverview(period, date);
    const dashboard = dashboardData?.data;

    const topCategoryIcon = dashboard?.cards.top_category
        ? <CategoryIcon iconName={dashboard.cards.top_category.icon} className="h-4 w-4"/>
        : null;

    const handlePeriodChange = useCallback((newPeriod: "monthly" | "yearly") => {
        setPeriod(newPeriod);
        setDate(newPeriod === "monthly" ? getCurrentMonth() : getCurrentYear());
    }, []);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        setDate((prev) => navigatePeriod(period, prev, direction));
    }, [period]);

    return (
        <div className="flex flex-1 flex-col">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-sm text-muted-foreground hidden sm:block">
                            {isLoading
                                ? "Loading your expense overview..."
                                : `Overview for ${formatPeriodDisplay(period, date)}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleNavigate("prev")}
                            disabled={isLoading}
                            aria-label="Previous period"
                        >
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <output
                            className="text-sm font-medium min-w-28 text-center px-2 py-1 border rounded-md bg-muted/40 hidden sm:block"
                            aria-live="polite"
                        >
                            {formatPeriodDisplay(period, date)}
                        </output>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleNavigate("next")}
                            disabled={isLoading}
                            aria-label="Next period"
                        >
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                        <PeriodToggle period={period} onPeriodChange={handlePeriodChange}/>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 p-4">
                {error && (
                    <Card>
                        <CardContent className="flex items-center justify-center gap-3 py-12">
                            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true"/>
                            <div>
                                <p className="text-sm font-medium text-destructive">Failed to load dashboard data</p>
                                <p className="text-xs text-muted-foreground mt-1">Please try again later.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {isLoading && <DashboardSkeleton/>}

                {!isLoading && dashboard && (
                    <>
                        {/* Stat cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <StatCard
                                title="Total Expenses"
                                value={formatCurrency(dashboard.cards.total_expenses.current)}
                                change={dashboard.cards.total_expenses.change_percentage}
                                previousValue={formatCurrency(dashboard.cards.total_expenses.previous)}
                                icon={<DollarSign className="h-4 w-4 text-muted-foreground"/>}
                            />

                            {dashboard.cards.top_category ? (
                                <StatCard
                                    title="Top Category"
                                    value={dashboard.cards.top_category.category_name}
                                    change={dashboard.cards.top_category.change_percentage}
                                    previousValue={formatCurrency(dashboard.cards.top_category.previous_total)}
                                    icon={topCategoryIcon}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="flex items-center justify-center py-8">
                                        <p className="text-sm text-muted-foreground">No category data</p>
                                    </CardContent>
                                </Card>
                            )}

                            {dashboard.cards.top_spender ? (
                                <StatCard
                                    title="Top Spender"
                                    value={dashboard.cards.top_spender.spent_by}
                                    change={dashboard.cards.top_spender.change_percentage}
                                    previousValue={formatCurrency(dashboard.cards.top_spender.previous_total)}
                                    icon={<User className="h-4 w-4 text-muted-foreground"/>}
                                />
                            ) : (
                                <Card>
                                    <CardContent className="flex items-center justify-center py-8">
                                        <p className="text-sm text-muted-foreground">No spender data</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Chart + Rankings */}
                        <div className="grid gap-4 lg:grid-cols-7">
                            <div className="lg:col-span-4">
                                <SpendingTrendChart data={dashboard.spending_chart} period={period}/>
                            </div>
                            <div className="lg:col-span-3">
                                <CategoryRankingBoard categories={dashboard.category_ranking}/>
                            </div>
                        </div>

                        {/* Recent transactions */}
                        <RecentExpenses/>
                    </>
                )}
            </div>
        </div>
    );
}
