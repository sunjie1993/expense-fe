"use client";

import {memo} from "react";
import {AlertCircle, Loader2, Pencil, Receipt} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form} from "@/components/ui/form";
import {useExpenseForm} from "@/hooks/use-expense-form";
import {ExpenseFormSkeleton} from "@/components/expenses/expense-states";
import {
    AmountField,
    CategoryInlineField,
    DateField,
    DescriptionField,
    PaymentMethodField,
    SpentByField,
} from "./form-fields";
import type {Expense} from "@/types/api";

interface ExpenseFormDialogProps {
    readonly expense?: Expense | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export const ExpenseFormDialog = memo(function ExpenseFormDialog({
    expense,
    open,
    onOpenChange,
}: ExpenseFormDialogProps) {
    const isEdit = !!expense;

    const {
        form,
        onSubmit,
        isSubmitting,
        error,
        mainCategories,
        allCategories,
        paymentMethods,
        isLoadingData,
    } = useExpenseForm({
        expense,
        open,
        onSuccess: () => onOpenChange(false),
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? <Pencil className="h-4 w-4"/> : <Receipt className="h-4 w-4"/>}
                        {isEdit ? "Edit Expense" : "Add New Expense"}
                    </DialogTitle>
                </DialogHeader>

                {isLoadingData ? (
                    <ExpenseFormSkeleton/>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                            <SpentByField control={form.control} disabled={isSubmitting}/>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AmountField control={form.control} disabled={isSubmitting}/>
                                <DateField control={form.control} disabled={isSubmitting}/>
                            </div>

                            <CategoryInlineField
                                control={form.control}
                                mainCategories={mainCategories}
                                allCategories={allCategories}
                                disabled={isSubmitting}
                            />

                            <PaymentMethodField
                                control={form.control}
                                paymentMethods={paymentMethods}
                                disabled={isSubmitting}
                            />

                            <DescriptionField control={form.control} disabled={isSubmitting}/>

                            {error && (
                                <div
                                    className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20"
                                    role="alert"
                                    aria-live="assertive"
                                >
                                    <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true"/>
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => { if (!isSubmitting) onOpenChange(false); }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true"/>
                                            Saving...
                                        </>
                                    ) : (
                                        isEdit ? "Save Changes" : "Save Expense"
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
