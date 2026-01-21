import useSWR from "swr";
import type {ApiResponse, ExpensesResponse} from "@/types/api";

interface UseExpensesParams {
    spentBy?: string;
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}

export function useExpenses(params: UseExpensesParams = {}) {
    const {limit = 50, offset = 0, spentBy, categoryId, startDate, endDate} = params;

    const searchParams = new URLSearchParams();
    searchParams.set("limit", limit.toString());
    searchParams.set("offset", offset.toString());

    if (spentBy) searchParams.set("spent_by", spentBy);
    if (categoryId) searchParams.set("category_id", categoryId.toString());
    if (startDate) searchParams.set("start_date", startDate);
    if (endDate) searchParams.set("end_date", endDate);

    return useSWR<ApiResponse<ExpensesResponse>>(
        `/api/expenses?${searchParams.toString()}`
    );
}
