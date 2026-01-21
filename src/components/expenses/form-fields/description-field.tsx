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

interface DescriptionFieldProps {
  readonly control: Control<ExpenseFormValues>;
  readonly disabled?: boolean;
}

/**
 * DescriptionField component for expense description input
 */
export const DescriptionField = memo(function DescriptionField({
  control,
  disabled = false,
}: DescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Description
            <span className="text-muted-foreground ml-1">(Optional)</span>
          </FormLabel>
          <FormControl>
            <Input
              placeholder="What was this expense for?"
              maxLength={500}
              disabled={disabled}
              {...field}
              className="transition-all"
              aria-label="Expense description"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});