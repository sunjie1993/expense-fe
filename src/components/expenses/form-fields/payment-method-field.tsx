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
import type { ExpenseFormValues } from "@/lib/validations/expense";
import type { PaymentMethod } from "@/types/api";

interface PaymentMethodFieldProps {
  readonly control: Control<ExpenseFormValues>;
  readonly paymentMethods: PaymentMethod[];
  readonly disabled?: boolean;
}

/**
 * PaymentMethodField component for selecting payment method
 */
export const PaymentMethodField = memo(function PaymentMethodField({
  control,
  paymentMethods,
  disabled = false,
}: PaymentMethodFieldProps) {
  return (
    <FormField
      control={control}
      name="payment_method_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">
            Payment Method <span className="text-destructive">*</span>
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="transition-all">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {method.name}
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