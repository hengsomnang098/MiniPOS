"use client";

import { useState } from "react";
import { Navbar } from "@/components/layouts/Navbar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layouts/sidebar";
import { Toaster } from "@/components/ui/toaster"; // ✅ added

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden">
      {/* Sidebar for desktop */}
      <div
        className={cn(
          "hidden md:flex transition-all duration-300",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile Sidebar Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white w-64 transform transition-transform duration-300 md:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar collapsed={false} setCollapsed={() => {}} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        {/* Mobile menu button */}
        <div className="md:hidden px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </Button>
          <span className="font-semibold text-slate-700">Dashboard</span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* ✅ Global Toast Notifications */}
      <Toaster />
    </div>
  );
}
