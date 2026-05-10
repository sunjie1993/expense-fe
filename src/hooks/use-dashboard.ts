import useSWR from "swr";
import type {
    ApiResponse,
    CategoryDrillDownData,
    DailyTrendData,
    DashboardOverview,
    ExpensesResponse,
    SpenderBreakdownData,
} from "@/types/api";

export function useDashboardOverview(period: "monthly" | "yearly", date: string) {
    return useSWR<ApiResponse<DashboardOverview>>(`/api/dashboard/overview?period=${period}&date=${date}`);
}

export function useSpenderBreakdown(period: "monthly" | "yearly", date: string) {
    return useSWR<ApiResponse<SpenderBreakdownData>>(`/api/dashboard/spender-breakdown?period=${period}&date=${date}`);
}

export function useCategoryDrillDown(categoryId: number | null, period: "monthly" | "yearly", date: string) {
    const url = categoryId === null
        ? null
        : `/api/dashboard/category-drill/${categoryId}?period=${period}&date=${date}`;
    return useSWR<ApiResponse<CategoryDrillDownData>>(url);
}

export function useDailyTrend(yearMonth: string | null) {
    return useSWR<ApiResponse<DailyTrendData>>(yearMonth ? `/api/dashboard/daily-trend?year_month=${yearMonth}` : null);
}

export function useRecentExpenses(limit: number = 5) {
    return useSWR<ApiResponse<ExpensesResponse>>(`/api/expenses?limit=${limit}&offset=0`);
}
