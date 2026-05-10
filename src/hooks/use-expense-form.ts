"use client";

import {useCallback, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSWRConfig} from "swr";
import {toast} from "sonner";
import {apiPost, apiPut, isExpenseKey} from "@/lib/api";
import {useAllCategories, useMainCategories} from "@/hooks/use-categories";
import {usePaymentMethods} from "@/hooks/use-payment-methods";
import {type ExpenseFormValues, expenseSchema, getTodayDate} from "@/lib/validations/expense";
import type {Expense} from "@/types/api";

interface UseExpenseFormProps {
    readonly expense?: Expense | null;
    readonly open: boolean;
    readonly onSuccess: () => void;
}

function emptyDefaults() {
    return {
        spent_by: undefined,
        category_id: "",
        payment_method_id: "",
        amount: "",
        expense_date: getTodayDate(),
        description: "",
    };
}

function expenseDefaults(expense: Expense) {
    return {
        spent_by: expense.spent_by,
        category_id: expense.category_id.toString(),
        payment_method_id: expense.payment_method_id.toString(),
        amount: expense.amount.toString(),
        expense_date: expense.expense_date,
        description: expense.description ?? "",
    };
}

export function useExpenseForm({expense, open, onSuccess}: UseExpenseFormProps) {
    const {mutate} = useSWRConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {data: mainCategoriesData, isLoading: loadingMainCategories} = useMainCategories();
    const {data: allCategoriesData, isLoading: loadingAllCategories} = useAllCategories();
    const {data: paymentMethodsData, isLoading: loadingPaymentMethods} = usePaymentMethods();

    const mainCategories = mainCategoriesData?.data ?? [];
    const allCategories = allCategoriesData?.data ?? [];
    const paymentMethods = paymentMethodsData?.data ?? [];

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: expense ? expenseDefaults(expense) : emptyDefaults(),
    });

    useEffect(() => {
        if (open && expense) {
            form.reset(expenseDefaults(expense));
        } else if (!open) {
            queueMicrotask(() => {
                form.reset(emptyDefaults());
                setError(null);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, expense?.id]);

    const onSubmit = useCallback(
        async (data: ExpenseFormValues) => {
            setError(null);
            setIsSubmitting(true);

            const body = {
                spent_by: data.spent_by,
                category_id: Number.parseInt(data.category_id, 10),
                payment_method_id: Number.parseInt(data.payment_method_id, 10),
                amount: Number.parseFloat(data.amount),
                expense_date: data.expense_date,
                description: data.description || undefined,
            };

            try {
                if (expense) {
                    await apiPut(`/api/expenses/${expense.id}`, body);
                } else {
                    await apiPost("/api/expenses", body);
                }

                await mutate(isExpenseKey);
                toast.success(expense ? "Expense updated successfully" : "Expense added successfully");
                onSuccess();
            } catch (err: unknown) {
                const action = expense ? "update" : "add";
                const message = err instanceof Error ? err.message : `Failed to ${action} expense`;
                setError(message);
                toast.error(`Failed to ${action} expense`, {description: message});
            } finally {
                setIsSubmitting(false);
            }
        },
        [mutate, onSuccess, expense]
    );

    return {
        form,
        onSubmit,
        isSubmitting,
        error,
        mainCategories,
        allCategories,
        paymentMethods,
        isLoadingData: loadingMainCategories || loadingAllCategories || loadingPaymentMethods,
    };
}
