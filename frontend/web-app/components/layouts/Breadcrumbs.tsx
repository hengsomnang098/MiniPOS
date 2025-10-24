"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const parts = pathname.split("/").filter(Boolean);

    // Convert path segments to breadcrumb items
    const crumbs = parts.map((part, index) => {
        const href = "/" + parts.slice(0, index + 1).join("/");
        const name = part.charAt(0).toUpperCase() + part.slice(1);
        return { name, href };
    });

    if (crumbs.length === 0) return null;

    return (
        <nav className="flex items-center text-sm text-slate-400 space-x-1">
            {crumbs.map((crumb, index) => (
                <span key={crumb.href} className="flex items-center">
                    {index > 0 && <ChevronRight className="h-4 w-4 mx-1 text-slate-500" />}
                    {index < crumbs.length - 1 ? (
                        <Link
                            href={crumb.href}
                            className="hover:text-white transition-colors"
                        >
                            {crumb.name}
                        </Link>
                    ) : (
                        <span className="text-white font-medium">{crumb.name}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
