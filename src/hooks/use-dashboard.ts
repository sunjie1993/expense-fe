import {useMemo} from "react";
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
    const url = useMemo(
        () => `/api/dashboard/overview?period=${period}&date=${date}`,
        [period, date]
    );
    return useSWR<ApiResponse<DashboardOverview>>(url);
}

export function useSpenderBreakdown(period: "monthly" | "yearly", date: string) {
    const url = useMemo(
        () => `/api/dashboard/spender-breakdown?period=${period}&date=${date}`,
        [period, date]
    );
    return useSWR<ApiResponse<SpenderBreakdownData>>(url);
}

export function useCategoryDrillDown(categoryId: number | null, period: "monthly" | "yearly", date: string) {
    const url = useMemo(
        () => categoryId !== null ? `/api/dashboard/category-drill/${categoryId}?period=${period}&date=${date}` : null,
        [categoryId, period, date]
    );
    return useSWR<ApiResponse<CategoryDrillDownData>>(url);
}

export function useDailyTrend(yearMonth: string | null) {
    const url = useMemo(
        () => yearMonth ? `/api/dashboard/daily-trend?year_month=${yearMonth}` : null,
        [yearMonth]
    );
    return useSWR<ApiResponse<DailyTrendData>>(url);
}

export function useRecentExpenses(limit: number = 5) {
    const url = useMemo(
        () => `/api/expenses?limit=${limit}&offset=0`,
        [limit]
    );
    return useSWR<ApiResponse<ExpensesResponse>>(url);
}
