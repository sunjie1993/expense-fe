"use client";

import {useState} from "react";
import {ChevronLeft, Plus} from "lucide-react";
import {ExpenseFormDialog} from "./expense-form-dialog";

export function AddExpenseFab() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="fixed right-0 top-1/3 z-50 hidden md:block">
                <button
                    onClick={() => setOpen(true)}
                    className="group flex items-center gap-2 bg-primary text-primary-foreground
                               translate-x-[calc(100%-36px)] hover:translate-x-0
                               transition-transform duration-300 ease-in-out
                               rounded-l-full shadow-lg py-3 pl-3 pr-5 cursor-pointer"
                >
                    <ChevronLeft className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-180"/>
                    <Plus className="h-4 w-4 shrink-0"/>
                    <span className="text-sm font-medium whitespace-nowrap">Add Expense</span>
                </button>
            </div>

            <ExpenseFormDialog open={open} onOpenChange={setOpen}/>
        </>
    );
}
