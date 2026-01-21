import useSWR from "swr";
import type {ApiResponse, Category, MainCategory} from "@/types/api";

export function useMainCategories() {
    return useSWR<ApiResponse<MainCategory[]>>("/api/categories/main");
}

export function useSubCategories(parentId: number | null) {
    return useSWR<ApiResponse<Category[]>>(
        parentId ? `/api/categories/sub/${parentId}` : null
    );
}

export function useAllCategories() {
    return useSWR<ApiResponse<Category[]>>("/api/categories/all");
}
