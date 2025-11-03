"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const parts = pathname.split("/").filter(Boolean);

    const crumbs = parts.map((part, index) => {
        const href = "/" + parts.slice(0, index + 1).join("/");
        // Humanize name: capitalize & shorten long IDs
        const isUUID = /^[0-9a-fA-F-]{10,}$/.test(part);
        const displayName = isUUID
            ? part.slice(0, 6) + "..." + part.slice(-4)
            : part.charAt(0).toUpperCase() + part.slice(1);
        return { name: displayName, fullName: part, href };
    });

    if (crumbs.length === 0) return null;

    return (
        <nav className="flex flex-wrap items-center text-sm text-slate-400 space-x-1 max-w-full overflow-hidden">
            {crumbs.map((crumb, index) => (
                <span
                    key={crumb.href}
                    className="flex items-center min-w-0 max-w-[150px] sm:max-w-none"
                >
                    {index > 0 && (
                        <ChevronRight className="h-4 w-4 mx-1 text-slate-500 shrink-0" />
                    )}

                    {index < crumbs.length - 1 ? (
                        <Link
                            href={crumb.href}
                            title={crumb.fullName}
                            className="truncate hover:text-white transition-colors"
                        >
                            {crumb.name}
                        </Link>
                    ) : (
                        <span
                            title={crumb.fullName}
                            className="truncate text-white font-medium"
                        >
                            {crumb.name}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
