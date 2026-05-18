"use client";

import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {CategoryIcon} from "@/components/ui/category-icon";
import {apiPut} from "@/lib/api";
import type {CategoryRow} from "./category-data-table";

const AVAILABLE_ICONS = [
    "credit-card", "home", "utensils", "plane", "shopping-cart",
    "car", "heart", "briefcase", "gamepad", "graduation-cap",
    "shirt", "smartphone", "coffee", "film", "gift", "dumbbell",
] as const;

const schema = z.object({
    name: z.string().min(1, "Name is required"),
    icon: z.string().min(1, "Icon is required"),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

type FormValues = z.infer<typeof schema>;

interface CategoryEditDialogProps {
    readonly row: CategoryRow | null;
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly onSuccess: () => void;
}

export function CategoryEditDialog({row, open, onOpenChange, onSuccess}: CategoryEditDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {name: "", icon: "credit-card", color: "#000000"},
    });

    useEffect(() => {
        if (row) {
            form.reset({
                name: row.name,
                icon: row.icon ?? "credit-card",
                color: row.color ?? "#000000",
            });
        }
    }, [row, form]);

    async function onSubmit(values: FormValues) {
        if (!row) return;
        try {
            await apiPut(`/api/categories/${row.id}`, values);
            toast.success("Category updated");
            onSuccess();
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update category");
        }
    }

    const watchedColor = form.watch("color");
    const watchedIcon = form.watch("icon");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit {row?.isMain ? "Category" : "Subcategory"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Category name"/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        <CategoryIcon iconName={watchedIcon} className="h-4 w-4"/>
                                                        <span className="capitalize">{watchedIcon.replace(/-/g, " ")}</span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {AVAILABLE_ICONS.map((icon) => (
                                                <SelectItem key={icon} value={icon}>
                                                    <div className="flex items-center gap-2">
                                                        <CategoryIcon iconName={icon} className="h-4 w-4"/>
                                                        <span className="capitalize">{icon.replace(/-/g, " ")}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <input
                                                    type="color"
                                                    value={watchedColor}
                                                    onChange={(e) => field.onChange(e.target.value)}
                                                    className="h-9 w-14 cursor-pointer rounded-md border border-input p-0.5 bg-transparent"
                                                />
                                            </div>
                                            <Input
                                                {...field}
                                                placeholder="#000000"
                                                className="font-mono uppercase"
                                                maxLength={7}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center gap-3 rounded-lg border p-3">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                style={{backgroundColor: /^#[0-9a-fA-F]{6}$/.test(watchedColor) ? watchedColor : "#e5e7eb"}}
                            >
                                <CategoryIcon iconName={watchedIcon} className="h-5 w-5 text-white"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium">{form.watch("name") || "Preview"}</p>
                                <p className="text-xs text-muted-foreground">{watchedColor}</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Saving…" : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
