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
                <div className="animate-hero-glow text-primary">
                    <svg viewBox="0 0 80 80" className="h-16 w-16 animate-float-pulse" aria-hidden="true">
                        <line x1="40" y1="6" x2="8" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                        <line x1="40" y1="6" x2="72" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                        <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                        <line x1="40" y1="6" x2="40" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
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
