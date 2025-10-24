"use client";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { cn } from "@/lib/utils"; // optional if you use tailwind merge utils

interface PermissionButtonProps extends React.ComponentProps<typeof Button> {
    permission: string | string[];
    hideIfNoAccess?: boolean; // hide completely instead of disabling
}

export function PermissionButton({
    permission,
    hideIfNoAccess = true,
    children,
    className,
    ...props
}: PermissionButtonProps) {
    const { hasPermission } = usePermission();

    const allowed = hasPermission(permission);

    if (!allowed && hideIfNoAccess) return null;

    return (
        <>
            {
                allowed ? (
                    <Button
                        {...props}

                        className={cn(!allowed ? "opacity-50 cursor-not-allowed" : "", className)}
                    >
                        {children}
                    </Button>
                ) :
                    <></>
            }
        </>
    );
}
