"use client";

import {useCallback, useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {AlertCircle, Loader2, Pencil, Tag} from "lucide-react";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {categorySchema, type CategoryFormValues} from "@/lib/validations/category";
import {useCategoryMutations} from "@/hooks/use-category-mutations";
import type {Category, MainCategory} from "@/types/api";

interface CategoryFormDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly category?: Category;
    readonly defaultParentId?: number;
    readonly mainCategories: MainCategory[];
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
    defaultParentId,
    mainCategories,
}: CategoryFormDialogProps) {
    const {create, update} = useCategoryMutations();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!category;
    const isSubMode = category
        ? category.parent_category_id !== null
        : defaultParentId !== undefined;

    const title = isEdit
        ? `Edit ${isSubMode ? "Subcategory" : "Category"}`
        : `Add ${isSubMode ? "Subcategory" : "Category"}`;

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {name: "", parent_category_id: null, icon: "", color: ""},
    });

    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    parent_category_id: category.parent_category_id,
                    icon: category.icon ?? "",
                    color: category.color ?? "",
                });
            } else {
                form.reset({
                    name: "",
                    parent_category_id: defaultParentId ?? null,
                    icon: "",
                    color: "",
                });
            }
        } else {
            queueMicrotask(() => {
                form.reset({name: "", parent_category_id: null, icon: "", color: ""});
                setError(null);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, category?.id]);

    const onSubmit = useCallback(
        async (values: CategoryFormValues) => {
            if (isSubMode && !values.parent_category_id) {
                form.setError("parent_category_id", {message: "Parent category is required"});
                return;
            }

            setError(null);
            setIsSubmitting(true);

            try {
                const payload: Record<string, unknown> = {name: values.name};

                if (isSubMode) {
                    payload.parent_category_id = values.parent_category_id;
                } else {
                    payload.parent_category_id = null;
                    if (values.icon) payload.icon = values.icon;
                    if (values.color) payload.color = values.color;
                }

                if (isEdit) {
                    await update(category!.id, payload);
                    toast.success("Category updated");
                } else {
                    await create(payload);
                    toast.success("Category created");
                }

                onOpenChange(false);
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                setError(msg);
                toast.error("Failed to save category", {description: msg});
            } finally {
                setIsSubmitting(false);
            }
        },
        [isSubMode, isEdit, category, create, update, onOpenChange, form]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? <Pencil className="h-4 w-4"/> : <Tag className="h-4 w-4"/>}
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category name" disabled={isSubmitting} {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        {isSubMode && (
                            <FormField
                                control={form.control}
                                name="parent_category_id"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select
                                            disabled={isSubmitting}
                                            onValueChange={(v) => field.onChange(Number(v))}
                                            value={field.value?.toString() ?? ""}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select parent"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {mainCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.icon} {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        )}

                        {!isSubMode && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="icon"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel>Icon <span className="text-muted-foreground font-normal">(emoji)</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="🍔" disabled={isSubmitting} {...field} />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="color"
                                    render={({field}) => {
                                        const pickerVal = /^#[0-9A-Fa-f]{6}$/.test(field.value ?? "")
                                            ? field.value!
                                            : "#6366f1";
                                        return (
                                            <FormItem>
                                                <FormLabel>Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={pickerVal}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            disabled={isSubmitting}
                                                            className="h-9 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
                                                        />
                                                        <Input
                                                            placeholder="#6366f1"
                                                            disabled={isSubmitting}
                                                            className="font-mono"
                                                            {...field}
                                                            value={field.value ?? ""}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        );
                                    }}
                                />
                            </>
                        )}

                        {error && (
                            <div
                                className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20"
                                role="alert"
                                aria-live="assertive"
                            >
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0" aria-hidden="true"/>
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                disabled={isSubmitting}
                                onClick={() => {
                                    if (!isSubmitting) onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true"/>
                                        Saving...
                                    </>
                                ) : isEdit ? "Save Changes" : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
