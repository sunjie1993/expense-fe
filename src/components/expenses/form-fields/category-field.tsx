"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import type {ExpenseFormValues} from "@/lib/validations/expense";
import type {MainCategory} from "@/types/api";

interface CategoryFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly categories: MainCategory[];
    readonly onCategoryChange: (value: string) => void;
    readonly disabled?: boolean;
}

/**
 * CategoryField component for selecting main expense category
 */
export const CategoryField = memo(function CategoryField({
                                                             control,
                                                             categories,
                                                             onCategoryChange,
                                                             disabled = false,
                                                         }: CategoryFieldProps) {
    return (
        <FormField
            control={control}
            name="main_category_id"
            render={({field}) => (
                <FormItem>
                    <FormLabel className="text-sm font-medium">
                        Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                        onValueChange={onCategoryChange}
                        value={field.value}
                        disabled={disabled}
                    >
                        <FormControl>
                            <SelectTrigger className="transition-all">
                                <SelectValue placeholder="Select category"/>
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});