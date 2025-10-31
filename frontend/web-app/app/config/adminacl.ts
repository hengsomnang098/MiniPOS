import { LucideIcon, Users, Store, ShieldCheck } from "lucide-react";

export interface SidebarItem {
    title: string;
    href: string;
    icon: LucideIcon;
    permission: string;
}

export interface SidebarGroup {
    title: string;
    items: SidebarItem[];
}

export const sidebarGroups: SidebarGroup[] = [
    {
        title: "Select Shop",
        items: [
            {
                title: "Select Shops",
                href: "/",
                icon: Store,
                permission: "Shops.View",
            },

        ],
    },
    {
        title: "Management Shop",
        items: [

            {
                title: "Categories",
                href: "/dashboard/categories",
                icon: ShieldCheck,
                permission: "Categories.View",
            },
            {
                title: "Manage Services",
                href: "/dashboard/services",
                icon: ShieldCheck,
                permission: "Services.View",
            }
        ],
    },
    {
        title: "Administration",
        items: [
            {
                title: "Manage Users",
                href: "/dashboard/users",
                icon: Users,
                permission: "Users.View",
            },
            {
                title: "Manage Roles",
                href: "/dashboard/roles",
                icon: ShieldCheck,
                permission: "Roles.View",
            },
            {
                title: "Manage Shops",
                href: "/dashboard/shops",
                icon: Store,
                permission: "Shops.ViewPage",
            },
        ],
    },
];
