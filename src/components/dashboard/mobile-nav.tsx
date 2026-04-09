"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Plus} from "lucide-react";
import {NAV_ITEMS} from "@/components/dashboard/nav-items";
import {CreateExpenseDialog} from "@/components/expenses/create-expense-dialog";
import {Button} from "@/components/ui/button";

export function MobileNav() {
    const pathname = usePathname();
    const [dialogOpen, setDialogOpen] = useState(false);

    const [dashItem, expensesItem] = NAV_ITEMS;
    const DashIcon = dashItem.icon;
    const ExpensesIcon = expensesItem.icon;

    return (
        <>
            <nav
                className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background"
                aria-label="Mobile navigation"
            >
                <div className="flex h-16 items-stretch">
                    <Link
                        href={dashItem.href}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                            pathname === dashItem.href
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <DashIcon className="h-5 w-5"/>
                        <span>{dashItem.title}</span>
                    </Link>

                    <div className="flex flex-1 items-center justify-center">
                        <Button
                            type="button"
                            size="icon"
                            variant="default"
                            onClick={() => setDialogOpen(true)}
                            className="h-14 w-14 rounded-full active:scale-95 transition-all -translate-y-3 elevation-2"
                            aria-label="Add Expense"
                        >
                            <Plus className="h-6 w-6"/>
                        </Button>
                    </div>

                    <Link
                        href={expensesItem.href}
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                            pathname === expensesItem.href
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <ExpensesIcon className="h-5 w-5"/>
                        <span>{expensesItem.title}</span>
                    </Link>
                </div>
            </nav>

            <CreateExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
        </>
    );
}
