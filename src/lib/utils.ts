import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(
    amount: number,
    options?: Intl.NumberFormatOptions
): string {
    return new Intl.NumberFormat("en-SG", {
        style: "currency",
        currency: "SGD",
        ...options,
    }).format(amount);
}

export function getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

export function getCurrentYear(): string {
    return new Date().getFullYear().toString();
}

export function formatPeriodDisplay(
    period: "monthly" | "yearly",
    date: string
): string {
    if (period === "monthly") {
        const [year, month] = date.split("-");
        const monthDate = new Date(
            Number.parseInt(year, 10),
            Number.parseInt(month, 10) - 1,
            1
        );
        return monthDate.toLocaleDateString("en-SG", {
            month: "long",
            year: "numeric",
        });
    }
    return date;
}

export function navigatePeriod(
    period: "monthly" | "yearly",
    currentDate: string,
    direction: "prev" | "next"
): string {
    if (period === "monthly") {
        const [year, month] = currentDate.split("-");
        const date = new Date(
            Number.parseInt(year, 10),
            Number.parseInt(month, 10) - 1,
            1
        );
        date.setMonth(date.getMonth() + (direction === "next" ? 1 : -1));
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, "0");
        return `${newYear}-${newMonth}`;
    }
    const year = Number.parseInt(currentDate, 10);
    return (year + (direction === "next" ? 1 : -1)).toString();
}

export function formatExpenseDate(dateString: string): {
    day: string;
    monthYear: string;
} {
    const date = new Date(dateString);
    return {
        day: date.toLocaleDateString("en-SG", {day: "numeric"}),
        monthYear: date.toLocaleDateString("en-SG", {
            month: "short",
            year: "numeric",
        }),
    };
}
