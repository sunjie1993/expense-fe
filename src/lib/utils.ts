import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Singapore Dollar currency
 * @param amount - The amount to format
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted currency string
 */
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

/**
 * Get the current month in YYYY-MM format
 * @returns Current month string
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get the current year as a string
 * @returns Current year string
 */
export function getCurrentYear(): string {
  return new Date().getFullYear().toString();
}

/**
 * Format a period date for display
 * @param period - The period type (monthly or yearly)
 * @param date - The date string (YYYY-MM or YYYY)
 * @returns Formatted date string
 */
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

/**
 * Navigate to the previous or next period
 * @param period - The period type (monthly or yearly)
 * @param currentDate - The current date string
 * @param direction - The direction to navigate (prev or next)
 * @returns New date string
 */
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

/**
 * Format a date string for display in expense list
 * @param dateString - The ISO date string to format
 * @returns Object with day and monthYear strings
 */
export function formatExpenseDate(dateString: string): {
  day: string;
  monthYear: string;
} {
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString("en-SG", { day: "numeric" }),
    monthYear: date.toLocaleDateString("en-SG", {
      month: "short",
      year: "numeric",
    }),
  };
}
