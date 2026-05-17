import {LayoutDashboard, Receipt, Settings} from "lucide-react";

export const NAV_ITEMS = [
    {title: "Dashboard", href: "/dashboard/", icon: LayoutDashboard},
    {title: "Expenses", href: "/dashboard/expenses/", icon: Receipt},
    {title: "Config", href: "/dashboard/config/", icon: Settings},
] as const;
