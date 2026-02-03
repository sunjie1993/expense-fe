"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/auth-context";
import {LayoutDashboard, LogOut, Receipt,} from "lucide-react";

const navItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Expenses",
        href: "/dashboard/expenses",
        icon: Receipt,
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const {logout} = useAuth();

    const handleLogout = () => {
        logout().catch((error) => {
            console.error("Logout failed:", error);
        });
    };

    return (
        <aside className="hidden md:flex flex-col w-64 border-r bg-card">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold">Expense Tracker</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4"/>
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-muted-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4"/>
                    Logout
                </Button>
            </div>
        </aside>
    );
}
