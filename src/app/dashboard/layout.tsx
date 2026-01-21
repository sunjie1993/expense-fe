"use client";

import {type ReactNode, useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/contexts/auth-context";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {AddExpenseFab} from "@/components/expenses/add-expense-fab";
import {Loader2} from "lucide-react";

export default function DashboardLayout({
                                            children,
                                        }: Readonly<{ children: ReactNode }>) {
    const router = useRouter();
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

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
