"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { sidebarGroups } from "@/app/config/adminacl";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
        <TooltipProvider delayDuration={200}>
            <div
                className={cn(
                    "relative flex flex-col h-full transition-all duration-500 ease-in-out border-r border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)] z-50",
                    "bg-linear-to-b from-[#0f172a] via-[#1e293b] to-[#0a0f1c]",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                {/* Collapse Button */}
                <button
                    onClick={() => setCollapsed?.(!collapsed)}
                    className="absolute -right-3 top-6 bg-[#1e293b]/90 border border-slate-700 text-slate-300 rounded-full p-1.5 hover:bg-slate-700/70 hover:text-white shadow-md transition-all duration-300 hidden md:flex"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>

                {/* Header */}
                <div className={cn("px-4 mb-3 transition-all duration-300", collapsed && "px-2")}>
                    <h2
                        className={cn(
                            "text-2xl font-bold tracking-wide mb-2 mt-2 text-center text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-300",
                            collapsed && "text-lg"
                        )}
                    >
                        {collapsed ? "MP" : "Mini POS"}
                    </h2>
                    <hr className="border-slate-700/60" />
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

                                        const button = (
                                            <Button
                                                key={item.href}
                                                asChild
                                                variant="ghost"
                                                className={cn(
                                                    "w-full justify-start transition-all duration-300 ease-in-out rounded-xl group py-3 backdrop-blur-sm",
                                                    "hover:bg-linear-to-r hover:from-cyan-700/30 hover:to-blue-700/30",
                                                    "hover:shadow-[0_0_10px_rgba(56,189,248,0.25)]",
                                                    isActive
                                                        ? "bg-linear-to-r from-cyan-600/40 to-blue-700/40 text-white shadow-[0_0_12px_rgba(56,189,248,0.35)]"
                                                        : "text-slate-300 hover:text-white",
                                                    collapsed && "justify-center px-0"
                                                )}
                                            >
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center w-full",
                                                        collapsed && "justify-center"
                                                    )}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                                                            isActive
                                                                ? "text-cyan-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.5)]"
                                                                : "text-slate-400 group-hover:text-cyan-300"
                                                        )}
                                                    />
                                                    {!collapsed && (
                                                        <span className="ml-3 text-[15px] font-medium">
                                                            {item.title}
                                                        </span>
                                                    )}
                                                </Link>
                                            </Button>
                                        );

                                        // ✅ Tooltip when collapsed
                                        return collapsed ? (
                                            <Tooltip key={item.href}>
                                                <TooltipTrigger asChild>{button}</TooltipTrigger>
                                                <TooltipContent side="right" className="border border-slate-700/60 p-0 rounded-lg overflow-hidden shadow-xl">
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -4 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="bg-slate-800/95 text-slate-100 text-sm font-medium px-3 py-1.5"
                                                    >
                                                        {item.title}
                                                    </motion.div>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            button
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}
