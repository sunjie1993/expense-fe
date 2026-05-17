"use client";

import {useCallback} from "react";
import {useSWRConfig} from "swr";
import {apiDelete, apiPost, apiPut} from "@/lib/api";
import type {ApiResponse, CategoryDetail} from "@/types/api";

const isCategoryKey = (key: unknown): boolean =>
    typeof key === "string" && key.includes("/api/categories");

export function useCategoryMutations() {
    const {mutate} = useSWRConfig();

    const invalidate = useCallback(() => mutate(isCategoryKey), [mutate]);

    const create = useCallback(
        async (data: Record<string, unknown>) => {
            const result = await apiPost<ApiResponse<CategoryDetail>>("/api/categories", data);
            await invalidate();
            return result;
        },
        [invalidate]
    );

    const update = useCallback(
        async (id: number, data: Record<string, unknown>) => {
            const result = await apiPut<ApiResponse<CategoryDetail>>(`/api/categories/${id}`, data);
            await invalidate();
            return result;
        },
        [invalidate]
    );

    const remove = useCallback(
        async (id: number) => {
            const result = await apiDelete<ApiResponse<null>>(`/api/categories/${id}`);
            await invalidate();
            return result;
        },
        [invalidate]
    );

    // PUT is_active without cache invalidation — caller updates local state per backend guidance
    const toggleActive = useCallback(async (id: number, active: boolean) => {
        await apiPut<ApiResponse<CategoryDetail>>(`/api/categories/${id}`, {is_active: active});
    }, []);

    return {create, update, remove, toggleActive};
}
