"use client";

import {useState} from "react";
import {Plus} from "lucide-react";
import {ExpenseFormDialog} from "./expense-form-dialog";

export function AddExpenseFab() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                aria-label="Add expense"
                className="fixed bottom-6 left-6 z-40
                           flex items-center gap-2
                           bg-primary text-primary-foreground
                           rounded-full shadow-lg
                           px-5 py-3
                           hover:bg-primary/90 active:scale-95
                           transition-all duration-150
                           cursor-pointer"
            >
                <Plus className="h-5 w-5 shrink-0"/>
                <span className="text-sm font-medium whitespace-nowrap">Add Expense</span>
            </button>

            <ExpenseFormDialog open={open} onOpenChange={setOpen}/>
        </>
    );
}
