"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Textarea} from "@/components/ui/textarea";
import type {ExpenseFormValues} from "@/lib/validations/expense";

interface DescriptionFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly disabled?: boolean;
}

export const DescriptionField = memo(function DescriptionField({control, disabled = false}: DescriptionFieldProps) {
    return (
        <FormField
            control={control}
            name="description"
            render={({field}) => (
                <FormItem>
                    <FormLabel>
                        Description <span className="text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="What was this expense for?"
                            maxLength={500}
                            disabled={disabled}
                            className="resize-none"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});