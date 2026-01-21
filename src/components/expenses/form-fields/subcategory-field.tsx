"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import type {ExpenseFormValues} from "@/lib/validations/expense";
import type {Category} from "@/types/api";

interface SubcategoryFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly subcategories: Category[];
    readonly placeholder: string;
    readonly disabled?: boolean;
}

/**
 * SubcategoryField component for selecting expense subcategory
 */
export const SubcategoryField = memo(function SubcategoryField({
                                                                   control,
                                                                   subcategories,
                                                                   placeholder,
                                                                   disabled = false,
                                                               }: SubcategoryFieldProps) {
    return (
        <FormField
            control={control}
            name="category_id"
            render={({field}) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">
                        Subcategory <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger className="transition-all">
                                <SelectValue placeholder={placeholder}/>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {subcategories.length === 0 ? (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No subcategories available
                                </div>
                            ) : (
                                subcategories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});