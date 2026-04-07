"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {type ExpenseFormValues, SPENDER_OPTIONS} from "@/lib/validations/expense";

interface SpentByFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly disabled?: boolean;
}

export const SpentByField = memo(function SpentByField({
                                                           control,
                                                           disabled = false,
                                                       }: SpentByFieldProps) {
    return (
        <FormField
            control={control}
            name="spent_by"
            render={({field}) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">
                        Spent By <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                        <div className="flex h-9 rounded-md border border-input overflow-hidden">
                            {SPENDER_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => field.onChange(option.value)}
                                    className={cn(
                                        "flex-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                        field.value === option.value
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});