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
                        Amount (SGD) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            autoComplete="off"
                            disabled={disabled}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});