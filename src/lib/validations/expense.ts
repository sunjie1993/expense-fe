import {z} from "zod";

export const expenseSchema = z.object({
    spent_by: z.enum(["SJ", "YS", "Shared"], {
        message: "Please select who spent",
    }),
    main_category_id: z.string().min(1, "Please select a category"),
    category_id: z.string().min(1, "Please select a subcategory"),
    payment_method_id: z.string().min(1, "Please select a payment method"),
    amount: z
        .string()
        .min(1, "Amount is required")
        .refine(
            (val) =>
                !Number.isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0.01,
            "Amount must be at least 0.01"
        ),
    expense_date: z.string().min(1, "Date is required"),
    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

export const SPENDER_OPTIONS = [
    {value: "SJ", label: "SJ"},
    {value: "YS", label: "YS"},
    {value: "Shared", label: "Shared"},
] as const;

export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}