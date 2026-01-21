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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPENDER_OPTIONS, type ExpenseFormValues } from "@/lib/validations/expense";

interface SpentByFieldProps {
  readonly control: Control<ExpenseFormValues>;
  readonly disabled?: boolean;
}

/**
 * SpentByField component for selecting who made the expense
 */
export const SpentByField = memo(function SpentByField({
  control,
  disabled = false,
}: SpentByFieldProps) {
  return (
    <FormField
      control={control}
      name="spent_by"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Spent By <span className="text-destructive">*</span>
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="transition-all">
                <SelectValue placeholder="Select who spent" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {SPENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
});