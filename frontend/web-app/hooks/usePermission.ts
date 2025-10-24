"use client";

import { useSession } from "next-auth/react";

export function usePermission() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions || [];

  // Single or multiple permission check
  const hasPermission = (perm: string | string[]) => {
    if (Array.isArray(perm)) return perm.some(p => permissions.includes(p));
    return permissions.includes(perm);
  };

  return { hasPermission, permissions };
}
