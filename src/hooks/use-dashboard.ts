import useSWR from "swr";
import type { ApiResponse, DashboardSummary, ExpensesResponse } from "@/types/api";

export function useDashboardSummary(startDate: string, endDate: string) {
  return useSWR<ApiResponse<DashboardSummary>>(
    `/api/dashboard/summary?start_date=${startDate}&end_date=${endDate}`
  );
}

export function useRecentExpenses(limit: number = 5) {
  return useSWR<ApiResponse<ExpensesResponse>>(
    `/api/expenses?limit=${limit}&offset=0`
  );
}
