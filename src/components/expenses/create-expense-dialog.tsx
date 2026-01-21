"use client";

import { memo } from "react";
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
import { useExpenseForm } from "@/hooks/use-expense-form";
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
 * CreateExpenseDialog component for adding new expenses
 * Provides a form to create expenses with validation and error handling
 */
export const CreateExpenseDialog = memo(function CreateExpenseDialog({
                                                                       open,
                                                                       onOpenChange,
                                                                     }: CreateExpenseDialogProps) {
  const {
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
  } = useExpenseForm({
    open,
    onSuccess: () => onOpenChange(false),
  });

  /**
   * Handle dialog close
   */
  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

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