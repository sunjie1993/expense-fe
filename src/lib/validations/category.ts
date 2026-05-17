import {z} from "zod";

export const categorySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
    parent_category_id: z.number().nullable().optional(),
    icon: z.string().max(100, "Max 100 characters").optional(),
    color: z.string().max(20, "Max 20 characters").optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
