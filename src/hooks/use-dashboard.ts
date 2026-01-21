import useSWR from "swr";
import type {ApiResponse, DashboardOverview, DashboardSummary, ExpensesResponse} from "@/types/api";

export function useDashboardSummary(startDate: string, endDate: string) {
    return useSWR<ApiResponse<DashboardSummary>>(
        `/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}`
    );
}

export function useDashboardOverview(period: "monthly" | "yearly", date: string) {
    return useSWR<ApiResponse<DashboardOverview>>(
        `/api/dashboard/overview?period=${period}&date=${date}`
    );
}

export function useRecentExpenses(limit: number = 5) {
    return useSWR<ApiResponse<ExpensesResponse>>(
        `/api/expenses?limit=${limit}&offset=0`
    );
}
