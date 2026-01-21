"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useMainCategories, useSubCategories } from "@/hooks/use-categories";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const expenseSchema = z.object({
  spent_by: z.enum(["SJ", "YS", "Shared"], {
    message: "Please select who spent",
  }),
  main_category_id: z.string().min(1, "Please select a category"),
  category_id: z.string().min(1, "Please select a subcategory"),
  payment_method_id: z.string().min(1, "Please select a payment method"),
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !Number.isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0.01,
    "Amount must be at least 0.01"
  ),
  expense_date: z.string().min(1, "Date is required"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateExpenseDialog({ open, onOpenChange }: Readonly<CreateExpenseDialogProps>) {
  const { mutate } = useSWRConfig();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMainCategory, setSelectedMainCategory] = useState<number | null>(null);

  const { data: mainCategoriesData, isLoading: loadingMainCategories } = useMainCategories();
  const { data: subCategoriesData, isLoading: loadingSubCategories } = useSubCategories(selectedMainCategory);
  const { data: paymentMethodsData, isLoading: loadingPaymentMethods } = usePaymentMethods();

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
      expense_date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (selectedMainCategory) {
      form.setValue("category_id", "");
    }
  }, [selectedMainCategory, form]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setSelectedMainCategory(null);
      setError(null);
    }
  }, [open, form]);

  async function onSubmit(data: ExpenseFormValues) {
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post("/api/expenses", {
        spent_by: data.spent_by,
        category_id: Number.parseInt(data.category_id),
        payment_method_id: Number.parseInt(data.payment_method_id),
        amount: Number.parseFloat(data.amount),
        expense_date: data.expense_date,
        description: data.description || undefined,
      });

      // Revalidate expenses and dashboard data
      await mutate((key) => typeof key === "string" && (key.includes("/api/expenses") || key.includes("/api/dashboard")));

      toast.success("Expense added successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const errorMessage = error.response?.data?.error || "Failed to create expense";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoadingData = loadingMainCategories || loadingPaymentMethods;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a new expense. Fill in all required fields.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (SGD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Spent By */}
              <FormField
                control={form.control}
                name="spent_by"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spent By</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select who spent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SJ">SJ</SelectItem>
                        <SelectItem value="YS">YS</SelectItem>
                        <SelectItem value="Shared">Shared</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Main Category */}
              <FormField
                control={form.control}
                name="main_category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedMainCategory(Number.parseInt(value));
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mainCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subcategory */}
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategory</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedMainCategory || loadingSubCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingSubCategories
                                ? "Loading..."
                                : !selectedMainCategory
                                ? "Select category first"
                                : "Select subcategory"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Payment Method */}
              <FormField
                control={form.control}
                name="payment_method_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id.toString()}>
                            {method.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date */}
              <FormField
                control={form.control}
                name="expense_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="What was this expense for?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
}
