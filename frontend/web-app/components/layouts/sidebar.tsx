"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { sidebarGroups } from "@/app/config/adminacl";

export function Sidebar({
    collapsed = false,
    setCollapsed,
}: {
    collapsed?: boolean;
    setCollapsed?: (v: boolean) => void;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const userPermissions = session?.user?.permissions || [];

    return (
        <div
            className={cn(
                "relative flex flex-col h-full bg-slate-900 text-slate-50 transition-all duration-300 ease-in-out border-r border-slate-800",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed?.(!collapsed)}
                className="absolute -right-3 top-6 bg-slate-800 border border-slate-700 text-slate-300 rounded-full p-1.5 hover:bg-slate-700 transition-all duration-200 hidden md:flex"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                ) : (
                    <ChevronLeft className="h-4 w-4" />
                )}
            </button>

            {/* Header */}
            <div className={cn("px-4 mb-3 transition-all duration-200", collapsed && "px-2")}>
                <h2
                    className={cn(
                        "text-2xl font-bold tracking-wide mb-2 text-center transition-all duration-300",
                        collapsed && "text-lg"
                    )}
                >
                    {collapsed ? "MP" : "Mini POS"}
                </h2>
                <hr className="border-slate-800" />
            </div>

            {/* Menu */}
            <div className="flex-1 overflow-y-auto px-3 space-y-7">
                {sidebarGroups.map((group) => {
                    const visibleItems = group.items.filter((item) =>
                        userPermissions.includes(item.permission)
                    );

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={group.title}>
                            {!collapsed && (
                                <h3 className="text-sm font-semibold text-slate-400 uppercase px-2 mb-3 tracking-wide">
                                    {group.title}
                                </h3>
                            )}

                            <div className="space-y-1.5">
                                {visibleItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Button
                                            key={item.href}
                                            asChild
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start transition-all duration-200 ease-in-out rounded-lg group py-3",
                                                isActive
                                                    ? "bg-slate-800 text-white shadow-md"
                                                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                                                collapsed && "justify-center px-0"
                                            )}
                                            title={collapsed ? item.title : ""}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn("flex items-center w-full", collapsed && "justify-center")}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                                                    )}
                                                />
                                                {!collapsed && (
                                                    <span className="ml-3 text-[15px] font-medium">{item.title}</span>
                                                )}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {!collapsed && (
                <div className="px-4 mt-auto pt-4 border-t border-slate-800 text-sm text-slate-500 text-center">
                    v1.0.0
                </div>
            )}
        </div>
    );
}
