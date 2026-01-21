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
                size="icon"
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
                aria-label="Add expense"
            >
                <Plus className="h-6 w-6"/>
            </Button>

            <CreateExpenseDialog open={open} onOpenChange={setOpen}/>
        </>
    );
}
