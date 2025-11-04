"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderFiltersProps {
  isStaff: boolean;
  initialStartDate: string; // yyyy-MM-dd
  initialEndDate: string;   // yyyy-MM-dd
}

export default function OrderFilters({ isStaff, initialStartDate, initialEndDate }: OrderFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [start, setStart] = useState(initialStartDate);
  const [end, setEnd] = useState(initialEndDate);

  const disabled = useMemo(() => isStaff, [isStaff]);

  function toQueryString(params: Record<string, string | undefined>) {
    const usp = new URLSearchParams(searchParams?.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (!v) usp.delete(k);
      else usp.set(k, v);
    });
    return usp.toString();
  }

  function onApply() {
    if (disabled) return;

    // Send end as exclusive (end + 1 day) to include whole selected end day
    const endDate = new Date(end);
    const endExclusive = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const qs = toQueryString({
      startDate: start,
      endDate: formatDate(endExclusive),
      page: "1",
    });
    router.push(`/dashboard?${qs}`);
  }

  function onToday() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();
    const s = new Date(y, m, d);
    const e = new Date(y, m, d + 1);
    const formatDate = (dt: Date) => {
      const yy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };
    const startStr = formatDate(s);
    const endStr = formatDate(e);

    const qs = toQueryString({ startDate: startStr, endDate: endStr, page: "1" });
    router.push(`/dashboard?${qs}`);
  }

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs text-muted-foreground mb-1">Start date</label>
        <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} disabled={disabled} />
      </div>
      <div className="flex-1">
        <label className="block text-xs text-muted-foreground mb-1">End date</label>
        <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} disabled={disabled} />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onToday}>Today</Button>
        <Button className="btn-deep-ocean" onClick={onApply} disabled={disabled}>Apply</Button>
      </div>
    </div>
  );
}
