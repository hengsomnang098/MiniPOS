"use client";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils"; // optional if you use tailwind merge utils
import Link from "next/link";

interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
    permission: string | string[];
    hideIfNoAccess?: boolean; // hide completely instead of disabling
    href?: string; // Add href prop for link functionality
}

export function PermissionButton({
    permission,
    hideIfNoAccess = true,
    children,
    className,
    href,
    ...props
}: PermissionButtonProps) {
    const { hasPermission } = usePermission();

    const allowed = hasPermission(permission);

    if (!allowed && hideIfNoAccess) return null;

    const buttonClass = cn(className);

    if (href && allowed) {
        return (
            <Button
                {...props}
                className={`cursor-pointer ${buttonClass}`}
                asChild
            >
                <Link href={href}>
                    {children}
                </Link>
            </Button>
        );
    }

    return allowed ? (
        <Button
            {...props}
            className={`cursor-pointer ${buttonClass}`}
        >
            {children}
        </Button>
    ) : null;
}
