import { LucideIcon, Users, Store, TagIcon, ShieldCheck } from "lucide-react";

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
        title: "Management",
        items: [
            {
                title: "Stores",
                href: "/dashboard/stores",
                icon: Store,
                permission: "Stores.View",
            },
            {
                title: "Categories",
                href: "/dashboard/categories",
                icon: TagIcon,
                permission: "Categories.View",
            },
        ],
    },
    {
        title: "Administration",
        items: [
            {
                title: "Users",
                href: "/dashboard/users",
                icon: Users,
                permission: "Users.View",
            },
            {
                title: "Roles",
                href: "/dashboard/roles",
                icon: ShieldCheck,
                permission: "Roles.View",
            },
        ],
    },
];
