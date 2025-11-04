"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import { SalesByProductItem } from "@/types/report";
import { getSalesByProduct, exportSalesByProductCsv } from "@/app/actions/reportAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Lazy-load heavy libs on demand
const loadXlsx = () => import("xlsx");
const loadJsPDF = () => import("jspdf");
const loadAutoTable = () => import("jspdf-autotable");

export default function SalesByProductClient({ initialShopId = "" }: { initialShopId?: string }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [shopId, setShopId] = useState<string>(initialShopId ?? "");
    const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [data, setData] = useState<SalesByProductItem[]>([]);

    // Fallback: try to infer selected shop from a readable cookie 'activeShopId' if not provided by server
    useEffect(() => {
        if (shopId) return; // already have one from server
        try {
            const raw = document.cookie
                .split("; ")
                .find((row) => row.startsWith("activeShopId="))
                ?.split("=")[1];
            const value = raw ? decodeURIComponent(raw) : "";
            if (value) setShopId(value);
        } catch {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totals = useMemo(() => {
        const qty = data.reduce((s, i) => s + i.totalQuantity, 0);
        const rev = data.reduce((s, i) => s + i.totalRevenue, 0);
        return { qty, rev };
    }, [data]);

    const query = () => {
        if (!shopId) {
            toast({ title: "Missing shop", description: "Please select a shop first.", variant: "destructive" });
            return;
        }
        startTransition(async () => {
            const start = startDate;
            const end = endDate;
            const res = await getSalesByProduct(shopId, start, end);
            if (!Array.isArray(res)) {
                toast({ title: "Failed to load report", variant: "destructive" });
                return;
            }
            setData(res);
        });
    };

    const exportExcel = async () => {
        if (data.length === 0) {
            toast({ title: "Nothing to export" });
            return;
        }
        const XLSX = await loadXlsx();
        const wsData = [
            ["Product Name", "Total Quantity", "Total Revenue"],
            ...data.map((d) => [d.productName, d.totalQuantity, d.totalRevenue]),
            ["TOTAL", totals.qty, totals.rev],
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SalesByProduct");
        const fileName = `sales_by_product_${startDate}_${endDate}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    const exportPdf = async () => {
        if (data.length === 0) {
            toast({ title: "Nothing to export" });
            return;
        }
        const { default: jsPDF } = await loadJsPDF();
        const { default: autoTable } = await loadAutoTable();
        const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
        doc.setFontSize(14);
        doc.text(`Sales by Product (${startDate} to ${endDate})`, 40, 40);
        const body = data.map((d) => [d.productName, d.totalQuantity, d.totalRevenue.toFixed(2)]);
        body.push(["TOTAL", totals.qty, totals.rev.toFixed(2)]);
        autoTable(doc, {
            head: [["Product Name", "Total Quantity", "Total Revenue"]],
            body,
            startY: 60,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [33, 150, 243] },
        });
        const fileName = `sales_by_product_${startDate}_${endDate}.pdf`;
        doc.save(fileName);
    };

    const downloadCsv = async () => {
        if (!shopId) return;
        const blob = await exportSalesByProductCsv(shopId, startDate, endDate);
        if (!blob) {
            toast({ title: "Export failed", description: "Could not generate CSV.", variant: "destructive" });
            return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `sales_by_product_${startDate}_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4 max-w-full">
            <h1 className="text-2xl font-bold">Sales by Product</h1>
            <Card className="p-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                <div className="min-w-0">
                    <label className="text-sm">Start date</label>
                    <Input className="w-full" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="min-w-0">
                    <label className="text-sm">End date</label>
                    <Input className="w-full" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="flex items-end gap-2 flex-wrap sm:col-span-3 lg:col-span-1">
                    <Button className="btn-deep-ocean" onClick={query} disabled={isPending}>Load</Button>
                    <Button variant="outline" onClick={downloadCsv} disabled={data.length === 0}>CSV</Button>
                    <Button variant="outline" onClick={exportExcel} disabled={data.length === 0}>Excel</Button>
                    <Button variant="outline" onClick={exportPdf} disabled={data.length === 0}>PDF</Button>
                </div>
            </Card>

            <Card className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="font-semibold">Results</div>
                    <div className="text-sm">Total Qty: {totals.qty} | Total Revenue: ${totals.rev.toFixed(2)}</div>
                </div>
                {/* Desktop/tablet table */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm table-auto">
                        <thead>
                            <tr className="text-left border-b">
                                <th className="py-2 pr-3">Product Name</th>
                                <th className="py-2 pr-3 text-right">Quantity</th>
                                <th className="py-2 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row) => (
                                <tr key={row.productId} className="border-b">
                                    <td className="py-2 pr-3 wrap-break-word whitespace-normal align-top">{row.productName}</td>
                                    <td className="py-2 pr-3 text-right align-top">{row.totalQuantity}</td>
                                    <td className="py-2 text-right align-top">${row.totalRevenue.toFixed(2)}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-6 text-center text-muted-foreground">No data</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile list */}
                <div className="md:hidden space-y-2">
                    {data.length === 0 && (
                        <div className="py-6 text-center text-muted-foreground">No data</div>
                    )}
                    {data.map((row) => (
                        <div key={row.productId} className="border rounded-md p-3 bg-white/50">
                            <div className="font-medium wrap-break-word mb-1">{row.productName}</div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Qty</span>
                                <span>{row.totalQuantity}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Revenue</span>
                                <span>${row.totalRevenue.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
