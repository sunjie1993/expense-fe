"use client";

import {useCallback, useState} from "react";
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

    const topCategoryIcon = dashboard?.cards.top_category
        ? <CategoryIcon iconName={dashboard.cards.top_category.icon} className="h-4 w-4"/>
        : null;

    const handlePeriodChange = useCallback((newPeriod: "monthly" | "yearly") => {
        setPeriod(newPeriod);
        setDate(newPeriod === "monthly" ? getCurrentMonth() : getCurrentYear());
    }, []);

    const handleNavigate = useCallback((direction: "prev" | "next") => {
        setDate((prevDate) => navigatePeriod(period, prevDate, direction));
    }, [period]);

    if (error) {
        return (
            <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
                <Card>
                    <CardContent className="flex items-center justify-center gap-3 py-12">
                        <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true"/>
                        <div>
                            <p className="text-sm font-medium text-destructive">
                                Failed to load dashboard data
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Please try again later.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        {isLoading
                            ? "Loading your expense overview..."
                            : `Overview for ${formatPeriodDisplay(period, date)}`}
                    </p>
                </div>
                <PeriodToggle period={period} onPeriodChange={handlePeriodChange}/>
            </div>

            {/* Period navigation */}
            <div className="flex items-center gap-2" aria-label="Period navigation">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate("prev")}
                    disabled={isLoading}
                    aria-label="Previous period"
                >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true"/>
                    Previous
                </Button>
                <output
                    className="text-sm font-medium min-w-36 text-center px-3 py-1.5 border rounded-md bg-muted/40"
                    aria-live="polite"
                >
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
                    <ChevronRight className="h-4 w-4" aria-hidden="true"/>
                </Button>
            </div>

            {/* Loading */}
            {isLoading && (
                <output className="flex items-center justify-center py-20 gap-3" aria-label="Loading dashboard data">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true"/>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </output>
            )}

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

                    {/* Chart + Rankings side by side on large screens */}
                    <div className="grid gap-4 lg:grid-cols-7">
                        <div className="lg:col-span-4">
                            <SpendingTrendChart data={dashboard.spending_chart} period={period}/>
                        </div>
                        <div className="lg:col-span-3">
                            <CategoryRankingBoard categories={dashboard.category_ranking}/>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}