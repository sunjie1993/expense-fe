"use client";

import {memo, useCallback} from "react";
import {format} from "date-fns";
import {type DateRange} from "react-day-picker";
import {CalendarIcon, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {SPENDER_OPTIONS} from "@/lib/validations/expense";

export interface ExpenseFilters {
    startDate?: string;
    endDate?: string;
    spentBy?: string;
}

interface ExpenseFilterProps {
    readonly filters: ExpenseFilters;
    readonly onFiltersChange: (filters: ExpenseFilters) => void;
}

export const ExpenseFilter = memo(function ExpenseFilter({filters, onFiltersChange}: ExpenseFilterProps) {
    const dateRange: DateRange | undefined = filters.startDate || filters.endDate
        ? {
            from: filters.startDate ? new Date(filters.startDate) : undefined,
            to: filters.endDate ? new Date(filters.endDate) : undefined,
        }
        : undefined;

    const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
        onFiltersChange({
            ...filters,
            startDate: range?.from ? format(range.from, "yyyy-MM-dd") : undefined,
            endDate: range?.to ? format(range.to, "yyyy-MM-dd") : undefined,
        });
    }, [filters, onFiltersChange]);

    const handleSpentByChange = useCallback((value: string) => {
        onFiltersChange({
            ...filters,
            spentBy: value === "all" ? undefined : value,
        });
    }, [filters, onFiltersChange]);

    const handleClearFilters = useCallback(() => {
        onFiltersChange({});
    }, [onFiltersChange]);

    const hasActiveFilters = filters.startDate || filters.endDate || filters.spentBy;

    const formatDateRange = () => {
        if (!dateRange?.from) return "Select date range";
        if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
        return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={cn(
                            "w-64 justify-start text-left font-normal",
                            !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4"/>
                        {formatDateRange()}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={handleDateRangeChange}
                        numberOfMonths={2}
                        disabled={(date) => date > new Date()}
                    />
                </PopoverContent>
            </Popover>

            {/* Spent By */}
            <Select value={filters.spentBy || "all"} onValueChange={handleSpentByChange}>
                <SelectTrigger className="w-32">
                    <SelectValue placeholder="Spent by"/>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {SPENDER_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-9">
                    <X className="mr-1 h-4 w-4"/>
                    Clear
                </Button>
            )}
        </div>
    );
});