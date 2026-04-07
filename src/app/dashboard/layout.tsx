"use client";

import {type ReactNode, useEffect} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {AddExpenseFab} from "@/components/expenses/add-expense-fab";

export default function DashboardLayout({children}: Readonly<{ children: ReactNode }>) {
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            globalThis.location.replace("/login/");
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-8">
                <div className="flex items-center justify-center gap-7 text-primary animate-squid-glow">
                    <div className="h-8 w-8 rounded-full border-2 border-current animate-squid-shape-pulse"
                         style={{animationDelay: "0ms"}}/>
                    <svg width="34" height="30" viewBox="0 0 34 30"
                         className="animate-squid-shape-pulse" style={{animationDelay: "200ms"}}>
                        <polygon points="17,2 32,28 2,28" fill="none" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <div className="h-8 w-8 border-2 border-current animate-squid-shape-pulse"
                         style={{animationDelay: "400ms"}}/>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar/>
            <main className="flex-1 overflow-auto pb-16 md:pb-0 animate-fade-in-up">
                {children}
            </main>
            <div className="hidden md:block">
                <AddExpenseFab/>
            </div>
            <MobileNav/>
        </div>
    );
}
