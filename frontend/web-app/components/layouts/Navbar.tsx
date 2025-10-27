"use client";

import { useSession, signOut } from "next-auth/react";
import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Breadcrumbs } from "./Breadcrumbs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "sticky top-0 z-10 flex items-center justify-between px-6 py-3",
                // 🌊 Deep Ocean gradient — subtle, elegant
                "bg-linear-to-r from-[#001529]/95 via-[#001f3f]/95 to-[#002b55]/95",
                "backdrop-blur-lg border-b border-cyan-500/10 shadow-[0_0_15px_rgba(0,120,200,0.15)]"
            )}
        >
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <Breadcrumbs />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.1 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-cyan-500/10 transition-all"
                        aria-label="View notifications"
                    >
                        <Bell className="h-5 w-5 text-cyan-300/80 hover:text-cyan-300 transition-colors" />
                    </Button>
                </motion.div>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.div whileHover={{ scale: 1.02 }}>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 text-slate-100/90 hover:text-cyan-300 hover:bg-cyan-600/10 transition-all"
                            >
                                <User className="h-5 w-5 text-cyan-300/80" />
                                <span className="text-sm font-medium">{user?.fullName || "User"}</span>
                                <ChevronDown className="h-4 w-4 opacity-70" />
                            </Button>
                        </motion.div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        align="end"
                        className="w-48 bg-[#001529]/95 text-slate-100 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,160,255,0.15)]"
                    >
                        <DropdownMenuLabel className="text-cyan-400/80">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-cyan-700/20" />
                        <DropdownMenuItem
                            onClick={() => signOut()}
                            className="flex items-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </motion.header>
    );
}
