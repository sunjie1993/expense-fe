"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {LayoutDashboard, Plus, Receipt} from "lucide-react";
import {CreateExpenseDialog} from "@/components/expenses/create-expense-dialog";

export function MobileNav() {
    const pathname = usePathname();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <nav
                className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background"
                aria-label="Mobile navigation"
            >
                <div className="flex h-16 items-stretch">
                    {/* Dashboard link */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                            pathname === "/dashboard"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutDashboard className="h-5 w-5"/>
                        <span>Dashboard</span>
                    </Link>

                    {/* Add button (center) */}
                    <div className="flex flex-1 items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 active:opacity-80"
                            aria-label="Add expense"
                        >
                            <Plus className="h-5 w-5"/>
                        </button>
                    </div>

                    {/* Expenses link */}
                    <Link
                        href="/dashboard/expenses"
                        className={cn(
                            "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
                            pathname === "/dashboard/expenses"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Receipt className="h-5 w-5"/>
                        <span>Expenses</span>
                    </Link>
                </div>
            </nav>

            <CreateExpenseDialog open={dialogOpen} onOpenChange={setDialogOpen}/>
        </>
    );
}
