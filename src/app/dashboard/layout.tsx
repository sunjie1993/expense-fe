"use client";

import {type ReactNode, useEffect} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {AddExpenseFab} from "@/components/expenses/add-expense-fab";
import {Loader2} from "lucide-react";

export default function DashboardLayout({children}: Readonly<{ children: ReactNode }>) {
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            globalThis.location.replace("/login/");
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <header className="h-14 border-b bg-background flex items-center px-6 shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">Expense Tracker</h1>
            </header>
            <div className="flex flex-1 overflow-hidden">
                <Sidebar/>
                <main className="flex-1 overflow-auto pb-16 md:pb-0 animate-fade-in-up">
                    {children}
                </main>
            </div>
            <div className="hidden md:block">
                <AddExpenseFab/>
            </div>
            <MobileNav/>
        </div>
    );
}
