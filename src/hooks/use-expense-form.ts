import {useCallback, useEffect, useMemo, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useSWRConfig} from "swr";
import {toast} from "sonner";
import {apiPost} from "@/lib/api";
import {useMainCategories, useSubCategories} from "@/hooks/use-categories";
import {usePaymentMethods} from "@/hooks/use-payment-methods";
import {type ExpenseFormValues, expenseSchema, getTodayDate,} from "@/lib/validations/expense";

interface UseExpenseFormProps {
    readonly open: boolean;
    readonly onSuccess: () => void;
}

/**
 * Custom hook for managing expense form state and submission
 * @param open - Whether the dialog is open
 * @param onSuccess - Callback when form submission succeeds
 */
export function useExpenseForm({open, onSuccess}: UseExpenseFormProps) {
    const {mutate} = useSWRConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);

    // Fetch data
    const {data: mainCategoriesData, isLoading: loadingMainCategories} =
        useMainCategories();
    const {data: subCategoriesData, isLoading: loadingSubCategories} =
        useSubCategories(selectedMainCategory);
    const {data: paymentMethodsData, isLoading: loadingPaymentMethods} =
        usePaymentMethods();

    const mainCategories = useMemo(() =>
            mainCategoriesData?.data || [],
        [mainCategoriesData?.data]
    );

    const subCategories = useMemo(() =>
            subCategoriesData?.data || [],
        [subCategoriesData?.data]
    );

    const paymentMethods = useMemo(() =>
            paymentMethodsData?.data || [],
        [paymentMethodsData?.data]
    );

    // Form setup
    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            spent_by: undefined,
            main_category_id: "",
            category_id: "",
            payment_method_id: "",
            amount: "",
            expense_date: getTodayDate(),
            description: "",
        },
    });

    // Reset subcategory when main category changes
    useEffect(() => {
        if (selectedMainCategory) {
            form.setValue("category_id", "");
        }
    }, [selectedMainCategory, form]);

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset();
            setSelectedMainCategory(null);
            setError(null);
        }
    }, [open, form]);

    /**
     * Handle main category change
     */
    const handleMainCategoryChange = useCallback(
        (value: string) => {
            form.setValue("main_category_id", value);
            setSelectedMainCategory(Number.parseInt(value, 10));
        },
        [form]
    );

    /**
     * Handle form submission
     */
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

                // Revalidate expenses and dashboard data
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
                const apiError = err as { response?: { data?: { error?: string } } };
                const errorMessage =
                    apiError.response?.data?.error || "Failed to create expense";
                setError(errorMessage);
                toast.error("Failed to add expense", {
                    description: errorMessage,
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [mutate, onSuccess]
    );

    /**
     * Get subcategory placeholder text based on state
     */
    const getSubcategoryPlaceholder = useCallback(() => {
        if (loadingSubCategories) return "Loading...";
        if (!selectedMainCategory) return "Select category first";
        return "Select subcategory";
    }, [loadingSubCategories, selectedMainCategory]);

    const isLoadingData = loadingMainCategories || loadingPaymentMethods;
    const subcategoryPlaceholder = getSubcategoryPlaceholder();

    return {
        form,
        onSubmit,
        isSubmitting,
        error,
        selectedMainCategory,
        mainCategories,
        subCategories,
        paymentMethods,
        isLoadingData,
        loadingSubCategories,
        handleMainCategoryChange,
        subcategoryPlaceholder,
    };
}