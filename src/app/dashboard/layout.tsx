"use client";

import {type ReactNode, useEffect} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {AddExpenseFab} from "@/components/expenses/add-expense-fab";
import {Loader2} from "lucide-react";

console.log("=== DASHBOARD LAYOUT MODULE LOADED ===");

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{ children: ReactNode }>) {
    const {isAuthenticated, isLoading} = useAuth();

    console.log("[DashboardLayout] Rendering - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

    useEffect(() => {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
        console.log("[DashboardLayout] useEffect triggered");
        console.log("[DashboardLayout] pathname:", pathname);
        console.log("[DashboardLayout] isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

        if (!isLoading && !isAuthenticated) {
            console.log("[DashboardLayout] NOT AUTHENTICATED! Redirecting to login...");
            globalThis.location.replace("/login/");
        } else {
            console.log("[DashboardLayout] No redirect needed yet");
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
        <div className="min-h-screen flex flex-col md:flex-row">
            <Sidebar/>
            <MobileNav/>
            <main className="flex-1 overflow-auto">{children}</main>
            <AddExpenseFab/>
        </div>
    );
}
