"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField?: keyof T;
    emptyMessage?: string;
    className?: string;
}

export function DataTable<T extends { id?: string | number }>({
    data,
    columns,
    keyField = "id",
    emptyMessage = "No records found.",
    className,
}: DataTableProps<T>) {
    return (
        <div
            className={cn(
                "w-full overflow-hidden rounded-2xl border border-border bg-card shadow-md",
                className
            )}
        >
            <div className="overflow-x-auto max-h-[70vh]">
                <Table className="hidden md:table w-full">
                    {/* 🔹 Desktop Header */}
                    <TableHeader className="sticky top-0 z-10 bg-linear-to-r from-[#00b7ff] via-[#0077ff] to-[#00b7ff] text-white shadow-[0_0_15px_rgba(0,183,255,0.6)]">
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead
                                    key={col.key as string}
                                    className={cn(
                                        "text-sm font-semibold uppercase tracking-wide py-3 border-b border-blue-400/40",
                                        col.align === "center"
                                            ? "text-center"
                                            : col.align === "right"
                                            ? "text-right"
                                            : "text-left",
                                        col.className
                                    )}
                                >
                                    <span className="drop-shadow-[0_0_4px_rgba(0,200,255,0.8)]">
                                        {col.label}
                                    </span>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>

                    {/* 🔹 Desktop Body */}
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((item, i) => (
                                <motion.tr
                                    key={String(item[keyField] ?? Math.random())}
                                    className={cn(
                                        "transition-colors duration-200 hover:bg-blue-50/40 border-b",
                                        i % 2 === 0 ? "bg-background" : "bg-muted/10"
                                    )}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    {columns.map((col) => (
                                        <TableCell
                                            key={col.key as string}
                                            className={cn(
                                                "py-3 text-sm text-foreground",
                                                col.align === "center"
                                                    ? "text-center"
                                                    : col.align === "right"
                                                    ? "text-right"
                                                    : "text-left",
                                                col.className
                                            )}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : (item[col.key as keyof T] as any)}
                                        </TableCell>
                                    ))}
                                </motion.tr>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="text-center text-muted-foreground py-8"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* 🔹 Mobile Responsive Cards */}
                <div className="block md:hidden divide-y divide-border">
                    {data.length > 0 ? (
                        data.map((item, i) => (
                            <motion.div
                                key={String(item[keyField] ?? Math.random())}
                                className={cn(
                                    "p-4 bg-background rounded-xl shadow-sm mb-3 border border-border hover:shadow-lg transition-all",
                                    i % 2 === 0 ? "bg-background" : "bg-muted/10"
                                )}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                {columns.map((col) => (
                                    <div key={col.key as string} className="flex justify-between py-1">
                                        <div className="font-semibold text-sm text-muted-foreground">
                                            {col.label}
                                        </div>
                                        <div className="text-sm text-foreground text-right">
                                            {col.render
                                                ? col.render(item)
                                                : (item[col.key as keyof T] as any)}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            {emptyMessage}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
