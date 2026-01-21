"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useMainCategories, useSubCategories } from "@/hooks/use-categories";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Loader2, AlertCircle, DollarSign } from "lucide-react";
import {
  expenseSchema,
  type ExpenseFormValues,
  getTodayDate,
} from "@/lib/validations/expense";
import {
  AmountField,
  SpentByField,
  CategoryField,
  SubcategoryField,
  PaymentMethodField,
  DateField,
  DescriptionField,
} from "./form-fields";

interface CreateExpenseDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

/**
 * Get subcategory placeholder text based on state
 */
function getSubcategoryPlaceholder(
  loadingSubCategories: boolean,
  selectedMainCategory: number | null
): string {
  if (loadingSubCategories) return "Loading...";
  if (!selectedMainCategory) return "Select category first";
  return "Select subcategory";
}

/**
 * CreateExpenseDialog component for adding new expenses
 * Provides a form to create expenses with validation and error handling
 */
export const CreateExpenseDialog = memo(function CreateExpenseDialog({
  open,
  onOpenChange,
}: CreateExpenseDialogProps) {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(
    null
  );

  const { data: mainCategoriesData, isLoading: loadingMainCategories } =
    useMainCategories();
  const { data: subCategoriesData, isLoading: loadingSubCategories } =
    useSubCategories(selectedMainCategory);
  const { data: paymentMethodsData, isLoading: loadingPaymentMethods } =
    usePaymentMethods();

  const mainCategories = mainCategoriesData?.data || [];
  const subCategories = subCategoriesData?.data || [];
  const paymentMethods = paymentMethodsData?.data || [];

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
        await api.post("/api/expenses", {
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
        onOpenChange(false);
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
    [mutate, onOpenChange]
  );

  /**
   * Handle dialog close
   */
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  }, [isSubmitting, onOpenChange]);

  const isLoadingData = loadingMainCategories || loadingPaymentMethods;
  const subcategoryPlaceholder = getSubcategoryPlaceholder(
    loadingSubCategories,
    selectedMainCategory
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" aria-hidden="true" />
            Add New Expense
          </DialogTitle>
          <DialogDescription>
            Record a new expense transaction. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div
            className="flex flex-col items-center justify-center py-12 space-y-3"
            role="status"
            aria-label="Loading form data"
          >
            <Loader2
              className="h-8 w-8 animate-spin text-primary"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              Loading form data...
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5 animate-in fade-in duration-300"
              noValidate
            >
              <AmountField control={form.control} disabled={isSubmitting} />

              <SpentByField control={form.control} disabled={isSubmitting} />

              <CategoryField
                control={form.control}
                categories={mainCategories}
                onCategoryChange={handleMainCategoryChange}
                disabled={isSubmitting}
              />

              <SubcategoryField
                control={form.control}
                subcategories={subCategories}
                placeholder={subcategoryPlaceholder}
                disabled={
                  !selectedMainCategory || loadingSubCategories || isSubmitting
                }
              />

              <PaymentMethodField
                control={form.control}
                paymentMethods={paymentMethods}
                disabled={isSubmitting}
              />

              <DateField control={form.control} disabled={isSubmitting} />

              <DescriptionField control={form.control} disabled={isSubmitting} />

              {/* Error Message */}
              {error && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle
                    className="h-4 w-4 text-destructive shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 transition-all"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  aria-label="Cancel and close dialog"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 transition-all"
                  disabled={isSubmitting}
                  aria-label={isSubmitting ? "Saving expense" : "Save expense"}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Saving...
                    </>
                  ) : (
                    "Save Expense"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
});
