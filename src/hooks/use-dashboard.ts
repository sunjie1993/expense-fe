import {useMemo} from "react";
import useSWR from "swr";
import type {ApiResponse, DashboardOverview, DashboardSummary, ExpensesResponse} from "@/types/api";

export function useDashboardSummary(startDate: string, endDate: string) {
    const url = useMemo(
        () => `/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}`,
        [startDate, endDate]
    );
    return useSWR<ApiResponse<DashboardSummary>>(url);
}

export function useDashboardOverview(period: "monthly" | "yearly", date: string) {
    const url = useMemo(
        () => `/api/dashboard/overview?period=${period}&date=${date}`,
        [period, date]
    );
    return useSWR<ApiResponse<DashboardOverview>>(url);
}

export function useRecentExpenses(limit: number = 5) {
    const url = useMemo(
        () => `/api/expenses?limit=${limit}&offset=0`,
        [limit]
    );
    return useSWR<ApiResponse<ExpensesResponse>>(url);
}
