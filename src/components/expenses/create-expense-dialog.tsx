"use client";

import {memo} from "react";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form} from "@/components/ui/form";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertCircle, Loader2, Receipt} from "lucide-react";
import {useExpenseForm} from "@/hooks/use-expense-form";
import {
    AmountField,
    CategoryField,
    DateField,
    DescriptionField,
    PaymentMethodField,
    SpentByField,
    SubcategoryField,
} from "./form-fields";

interface CreateExpenseDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

function FormSkeleton() {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-28"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24"/>
                    <Skeleton className="h-9 w-full"/>
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24"/>
                <Skeleton className="h-16 w-full"/>
            </div>
            <div className="flex gap-3 pt-2">
                <Skeleton className="h-9 flex-1"/>
                <Skeleton className="h-9 flex-1"/>
            </div>
        </div>
    );
}

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

    const handleClose = () => {
        if (!isSubmitting) onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-4 w-4"/>
                        Add New Expense
                    </DialogTitle>
                </DialogHeader>

                {isLoadingData ? (
                    <FormSkeleton/>
                ) : (
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                            noValidate
                        >
                            {/* Row 1: Amount + Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <AmountField control={form.control} disabled={isSubmitting}/>
                                <DateField control={form.control} disabled={isSubmitting}/>
                            </div>

                            {/* Row 2: Spent By + Payment Method */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <SpentByField control={form.control} disabled={isSubmitting}/>
                                <PaymentMethodField
                                    control={form.control}
                                    paymentMethods={paymentMethods}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Row 3: Category + Subcategory */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    disabled={!selectedMainCategory || loadingSubCategories || isSubmitting}
                                />
                            </div>

                            {/* Row 4: Description */}
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
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isSubmitting}
                                    aria-label={isSubmitting ? "Saving expense" : "Save expense"}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true"/>
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
