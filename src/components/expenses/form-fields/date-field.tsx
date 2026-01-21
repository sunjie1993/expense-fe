"use client";

import { memo } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { ExpenseFormValues } from "@/lib/validations/expense";

interface DateFieldProps {
  readonly control: Control<ExpenseFormValues>;
  readonly disabled?: boolean;
}

/**
 * DateField component for selecting expense date
 */
export const DateField = memo(function DateField({
  control,
  disabled = false,
}: DateFieldProps) {
  return (
    <FormField
      control={control}
      name="expense_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Date <span className="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="date"
              disabled={disabled}
              {...field}
              className="transition-all"
              aria-label="Expense date"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});