"use client";

import {useState} from "react";
import {Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ExpenseFormDialog} from "./expense-form-dialog";

export function AddExpenseFab() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="default"
                className="fixed bottom-6 right-6 h-14 px-5 rounded-full active:scale-95 transition-all z-50 gap-2 shadow-lg hover:shadow-xl"
            >
                <Plus className="h-5 w-5 shrink-0"/>
                <span className="text-sm font-medium">Add Expense</span>
            </Button>

            <ExpenseFormDialog open={open} onOpenChange={setOpen}/>
        </>
    );
}
