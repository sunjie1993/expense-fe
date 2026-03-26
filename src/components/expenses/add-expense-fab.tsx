"use client";

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {CreateExpenseDialog} from "./create-expense-dialog";
import {Plus} from "lucide-react";

export function AddExpenseFab() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="secondary"
                className="fixed bottom-6 right-6 h-14 px-5 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 gap-2"
            >
                <Plus className="h-5 w-5 shrink-0"/>
                <span className="text-sm font-medium">Add Expense</span>
            </Button>

            <CreateExpenseDialog open={open} onOpenChange={setOpen}/>
        </>
    );
}
