"use client";

import {type ReactNode, useEffect} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {AddExpenseFab} from "@/components/expenses/add-expense-fab";
import Link from "next/link";
import {Loader2, LogOut, Settings, User} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function DashboardLayout({children}: Readonly<{ children: ReactNode }>) {
    const {isAuthenticated, isLoading, logout} = useAuth();

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
            <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
                <h1 className="text-xl font-semibold tracking-tight">Expense Tracker</h1>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
                            <User className="h-4 w-4"/>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/config/" className="flex items-center gap-2">
                                <Settings className="h-4 w-4"/>
                                Config
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator/>
                        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive gap-2">
                            <LogOut className="h-4 w-4"/>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
