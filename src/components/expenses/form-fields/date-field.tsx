"use client";

import {memo} from "react";
import {Control} from "react-hook-form";
import {format} from "date-fns";
import {CalendarIcon} from "lucide-react";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import type {ExpenseFormValues} from "@/lib/validations/expense";

interface DateFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly disabled?: boolean;
}

export const DateField = memo(function DateField({control, disabled = false}: DateFieldProps) {
    return (
        <FormField
            control={control}
            name="expense_date"
            render={({field}) => {
                const selectedDate = field.value ? new Date(field.value) : undefined;

                return (
                    <FormItem className="flex flex-col">
                        <FormLabel>
                            Date <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant="outline"
                                        disabled={disabled}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? format(selectedDate!, "PPP") : "Pick a date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50"/>
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    captionLayout="dropdown"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                    }}
                                    disabled={(date) => date > new Date()}
                                    defaultMonth={selectedDate}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage/>
                    </FormItem>
                );
            }}
        />
    );
});