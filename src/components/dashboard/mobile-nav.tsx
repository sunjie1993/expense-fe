"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/contexts/auth-context";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {LayoutDashboard, LogOut, Menu, Receipt} from "lucide-react";

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

export function MobileNav() {
    const pathname = usePathname();
    const {logout} = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-bold">Expense Tracker</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5"/>
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-2",
                                        isActive && "font-medium"
                                    )}
                                >
                                    <item.icon className="h-4 w-4"/>
                                    {item.title}
                                </Link>
                            </DropdownMenuItem>
                        );
                    })}
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2"/>
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
