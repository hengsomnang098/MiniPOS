"use client";

import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";

export default function ReprintButton({ id }: { id: string }) {
  const { hasPermission } = usePermission();
  const canView = hasPermission("Orders.View");

  if (!canView) return null;

  return (
    <Button
      className="btn-deep-ocean"
      onClick={() => {
        try {
          window.open(`/dashboard/orders/${id}/print`, "_blank");
        } catch {
          // ignore popup blockers
        }
      }}
    >
      Reprint
    </Button>
  );
}
