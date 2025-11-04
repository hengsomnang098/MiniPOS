import {
    LucideIcon,
    Store,
    Package,
    Wrench,
    Users,
    Shield,
    Settings,
    Tags,
} from "lucide-react";

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
                title: "POS",
                href: "/dashboard/pos",
                icon: Package, // 🧾 POS for ordering
                permission: "Orders.View",
            },
            {
                title: "Dashboard",
                href: "/dashboard/",
                icon: Package, // 🧾 POS for ordering
                permission: "Orders.View",
            },
            {
                title: "Select Shop",
                href: "/",
                icon: Tags, // 🏷️ tags are intuitive for categories
                permission: "Shops.View",
            },

        ]
    },
    {
        title: "Management Shop",
        items: [
            {
                title: "Categories",
                href: "/dashboard/categories",
                icon: Tags, // 🏷️ tags are intuitive for categories
                permission: "Categories.View",
            },
            {
                title: "Manage Services",
                href: "/dashboard/services",
                icon: Wrench, // 🔧 represents managing or configuring services
                permission: "Services.View",
            },
            {
                title: "Products",
                href: "/dashboard/products",
                icon: Package, // 📦 product/package icon for product management
                permission: "Products.View",
            },

        ],
    },
    {
        title: "Administration",
        items: [
            {
                title: "Manage Users",
                href: "/dashboard/users",
                icon: Users, // 👥 classic for users
                permission: "Users.View",
            },
            {
                title: "Manage Roles",
                href: "/dashboard/roles",
                icon: Shield, // 🛡️ for roles/permissions
                permission: "Roles.View",
            },
            {
                title: "Manage Shops",
                href: "/dashboard/shops",
                icon: Store, // 🏪 store for shop management
                permission: "Shops.ViewPage",
            },
            {
                title: "Settings",
                href: "/dashboard/settings",
                icon: Settings, // ⚙️ global admin settings
                permission: "Settings.View",
            },
        ],
    },
];
