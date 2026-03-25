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

    const handleClearDate = useCallback(() => {
        onFiltersChange({...filters, startDate: undefined, endDate: undefined});
    }, [filters, onFiltersChange]);

    const handleClearSpentBy = useCallback(() => {
        onFiltersChange({...filters, spentBy: undefined});
    }, [filters, onFiltersChange]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
                {/* Date Range */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full sm:w-64 justify-start text-left font-normal",
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
                            numberOfMonths={1}
                            disabled={(date) => date > new Date()}
                        />
                    </PopoverContent>
                </Popover>

                {/* Spent By */}
                <Select value={filters.spentBy || "all"} onValueChange={handleSpentByChange}>
                    <SelectTrigger className="w-full sm:w-32">
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
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {(filters.startDate || filters.endDate) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-primary/20">
                            <CalendarIcon className="h-3 w-3"/>
                            {formatDateRange()}
                            <button
                                onClick={handleClearDate}
                                className="ml-0.5 hover:text-primary transition-colors"
                                aria-label="Clear date filter"
                            >
                                <X className="h-3 w-3"/>
                            </button>
                        </span>
                    )}
                    {filters.spentBy && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-primary/20">
                            {filters.spentBy}
                            <button
                                onClick={handleClearSpentBy}
                                className="ml-0.5 hover:text-primary transition-colors"
                                aria-label="Clear spender filter"
                            >
                                <X className="h-3 w-3"/>
                            </button>
                        </span>
                    )}
                    <button
                        onClick={handleClearFilters}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
});