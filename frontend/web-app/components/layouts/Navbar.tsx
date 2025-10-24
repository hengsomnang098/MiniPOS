"use client";

import { useSession, signOut } from "next-auth/react";
import {
    Bell,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";
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

export function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="flex items-center justify-between px-6 py-3 bg-slate-900 text-slate-50 border-b border-slate-800">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <Breadcrumbs />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-slate-800"
                    aria-label="View notifications"
                >
                    <Bell className="h-5 w-5 text-slate-300" />
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            <span>{user?.fullName || "User"}</span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-48 bg-slate-800 text-slate-50">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut()}
                            className="flex items-center gap-2 text-red-400"
                        >
                            <LogOut className="h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
