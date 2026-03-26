"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import type {ExpenseFormValues} from "@/lib/validations/expense";

interface AmountFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly disabled?: boolean;
}

export const AmountField = memo(function AmountField({control, disabled = false}: AmountFieldProps) {
    return (
        <FormField
            control={control}
            name="amount"
            render={({field}) => (
                <FormItem>
                    <FormLabel>
                        Amount <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                        <div className="relative">
                            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center border-r border-input rounded-l-md select-none">
                                <span className="text-sm font-medium text-muted-foreground">SGD</span>
                            </div>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                autoComplete="off"
                                disabled={disabled}
                                autoFocus
                                className="pl-16"
                                {...field}
                            />
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});
