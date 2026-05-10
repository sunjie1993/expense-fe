"use client";

import {memo, useMemo, useState} from "react";
import {Control} from "react-hook-form";
import {ArrowLeft, Check, ChevronRight, ChevronsUpDown} from "lucide-react";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CategoryIcon} from "@/components/ui/category-icon";
import {cn} from "@/lib/utils";
import type {ExpenseFormValues} from "@/lib/validations/expense";
import type {Category, MainCategory} from "@/types/api";

interface CategoryInlineFieldProps {
    readonly control: Control<ExpenseFormValues>;
    readonly mainCategories: MainCategory[];
    readonly allCategories: Category[];
    readonly disabled?: boolean;
}

type Group = {main: MainCategory; subs: Category[]};

export const CategoryInlineField = memo(function CategoryInlineField({
    control,
    mainCategories,
    allCategories,
    disabled = false,
}: CategoryInlineFieldProps) {
    const [open, setOpen] = useState(false);
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);

    const groups = useMemo(() => {
        const subsByParent = new Map<number, Category[]>();
        for (const cat of allCategories) {
            if (cat.parent_category_id !== null) {
                const existing = subsByParent.get(cat.parent_category_id) ?? [];
                subsByParent.set(cat.parent_category_id, [...existing, cat]);
            }
        }
        return mainCategories.map((main) => ({
            main,
            subs: subsByParent.get(main.id) ?? [],
        }));
    }, [mainCategories, allCategories]);

    const labelMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const {main, subs} of groups) {
            if (subs.length === 0) map.set(main.id.toString(), main.name);
            for (const sub of subs) map.set(sub.id.toString(), sub.name);
        }
        return map;
    }, [groups]);

    function handleOpenChange(next: boolean) {
        setOpen(next);
        if (!next) setActiveGroup(null);
    }

    function handleMainClick(group: Group, onChange: (v: string) => void) {
        if (group.subs.length === 0) {
            onChange(group.main.id.toString());
            setOpen(false);
        } else {
            setActiveGroup(group);
        }
    }

    function handleSubClick(id: number, onChange: (v: string) => void) {
        onChange(id.toString());
        setOpen(false);
        setActiveGroup(null);
    }

    return (
        <FormField
            control={control}
            name="category_id"
            render={({field}) => (
                <FormItem>
                    <FormLabel>
                        Category <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover open={open} onOpenChange={handleOpenChange}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    disabled={disabled}
                                    className={cn(
                                        "h-9 w-full justify-between font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? labelMap.get(field.value) : "Select category"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-[var(--radix-popover-trigger-width)] p-0"
                            align="start"
                        >
                            {activeGroup ? (
                                <>
                                    <button
                                        type="button"
                                        className="flex w-full items-center gap-2 border-b px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                                        onClick={() => setActiveGroup(null)}
                                    >
                                        <ArrowLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>
                                        <CategoryIcon
                                            iconName={activeGroup.main.icon}
                                            className="h-3.5 w-3.5 shrink-0"
                                            color={activeGroup.main.color}
                                        />
                                        <span>{activeGroup.main.name}</span>
                                    </button>
                                    <div className="py-1">
                                        {activeGroup.subs.map((sub) => (
                                            <button
                                                key={sub.id}
                                                type="button"
                                                className={cn(
                                                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-accent",
                                                    field.value === sub.id.toString() && "bg-accent"
                                                )}
                                                onClick={() => handleSubClick(sub.id, field.onChange)}
                                            >
                                                <span>{sub.name}</span>
                                                {field.value === sub.id.toString() && (
                                                    <Check className="ml-auto h-4 w-4 shrink-0"/>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 p-2">
                                    {groups.map((group) => {
                                        const isActive =
                                            field.value === group.main.id.toString() ||
                                            group.subs.some((s) => s.id.toString() === field.value);
                                        return (
                                            <button
                                                key={group.main.id}
                                                type="button"
                                                className={cn(
                                                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-left transition-colors hover:bg-accent",
                                                    isActive && "bg-accent"
                                                )}
                                                onClick={() => handleMainClick(group, field.onChange)}
                                            >
                                                <CategoryIcon
                                                    iconName={group.main.icon}
                                                    className="h-4 w-4 shrink-0"
                                                    color={group.main.color}
                                                />
                                                <span className="flex-1 truncate">{group.main.name}</span>
                                                {group.subs.length > 0 ? (
                                                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground"/>
                                                ) : (
                                                    isActive && <Check className="h-3.5 w-3.5 shrink-0"/>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
});
