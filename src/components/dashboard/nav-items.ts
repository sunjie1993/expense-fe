import {LayoutDashboard, Receipt} from "lucide-react";

export const NAV_ITEMS = [
    {title: "Dashboard", href: "/dashboard", icon: LayoutDashboard},
    {title: "Expenses", href: "/dashboard/expenses", icon: Receipt},
] as const;
