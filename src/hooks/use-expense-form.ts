import {useCallback, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSWRConfig} from "swr";
import {toast} from "sonner";
import {apiPost} from "@/lib/api";
import {useAllCategories, useMainCategories} from "@/hooks/use-categories";
import {usePaymentMethods} from "@/hooks/use-payment-methods";
import {type ExpenseFormValues, expenseSchema, getTodayDate} from "@/lib/validations/expense";

interface UseExpenseFormProps {
    readonly open: boolean;
    readonly onSuccess: () => void;
}

export function useExpenseForm({open, onSuccess}: UseExpenseFormProps) {
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
        defaultValues: {
            spent_by: undefined,
            category_id: "",
            payment_method_id: "",
            amount: "",
            expense_date: getTodayDate(),
            description: "",
        },
    });

    useEffect(() => {
        if (!open) {
            queueMicrotask(() => {
                form.reset();
                setError(null);
            });
        }
    }, [open, form]);

    const onSubmit = useCallback(
        async (data: ExpenseFormValues) => {
            setError(null);
            setIsSubmitting(true);

            try {
                await apiPost("/api/expenses", {
                    spent_by: data.spent_by,
                    category_id: Number.parseInt(data.category_id, 10),
                    payment_method_id: Number.parseInt(data.payment_method_id, 10),
                    amount: Number.parseFloat(data.amount),
                    expense_date: data.expense_date,
                    description: data.description || undefined,
                });

                await mutate(
                    (key) =>
                        typeof key === "string" &&
                        (key.includes("/api/expenses") || key.includes("/api/dashboard"))
                );

                toast.success("Expense added successfully", {
                    description: "Your expense has been recorded.",
                });
                onSuccess();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to create expense";
                setError(message);
                toast.error("Failed to add expense", {description: message});
            } finally {
                setIsSubmitting(false);
            }
        },
        [mutate, onSuccess]
    );

    const isLoadingData = loadingMainCategories || loadingAllCategories || loadingPaymentMethods;

    return {
        form,
        onSubmit,
        isSubmitting,
        error,
        mainCategories,
        allCategories,
        paymentMethods,
        isLoadingData,
    };
}
