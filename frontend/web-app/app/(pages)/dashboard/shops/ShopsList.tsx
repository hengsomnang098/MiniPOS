"use client";

import { PermissionButton } from "@/components/permissionButton/PermissionButton";
import { useToast } from "@/components/ui/use-toast";
import { Shops } from "@/types/shop";
import { useState, useTransition } from "react";
import LoadingPage from "../loading";
import { DataTable } from "@/components/DataTable";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PageResult } from "@/types/pageResult";
import AppPagination from "@/components/AppPagination";
import { ShopFormDialog } from "./ShopFormDialog";
import { createShop, deleteShop, updateShop } from "@/app/actions/shopAction";
import { Users } from "@/types/user";

interface ShopsListProps {
    initialShops: PageResult<Shops>;
    initialUser?: Users[];
}

export default function ShopsList({ initialShops, initialUser }: ShopsListProps) {
    const [shops, setShops] = useState(initialShops.items);
    const [pageNumber, setPageNumber] = useState(initialShops.pageNumber ?? 1);
    const [totalPages, setTotalPages] = useState(initialShops.totalPages ?? 1);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<Shops | null>(null);

    async function handleCreate(data: Partial<Shops>) {
        startTransition(async () => {
            try{
                const result = await createShop(data);
            setShops((prev) => [...prev, result]);
                toast({
                    title: "✅ Shop Created",
                    description: `${result.name} added successfully.`,
                });
            } catch (error) {
                console.log(error)
            }
        })
    }

    async function handleUpdate(id: string, data: Partial<Shops>) {
        startTransition(async () => {
            try{
                const result = await updateShop(id,{...data, id});
            setShops((prev) => prev.map((shop) => (shop.id === id ? result : shop)));
                toast({
                    title: "✅ Shop Updated",
                    description: `${result.name} updated successfully.`,
                });
            } catch (error) {
                console.log(error)
            }
        });
    }

    async function handlePageChange(page: number) {
        startTransition(async () => {
            try {
                // ✅ Fetch data directly from API
                const res = await fetch(`/api/shop?page=${page}&pageSize=10`, {
                    cache: "no-store",
                });

                if (!res.ok) throw new Error("Failed to load shops");

                const data: PageResult<Shops> = await res.json();
                setShops(data.items);
                setPageNumber(data.pageNumber ?? page);
                setTotalPages(data.totalPages ?? 1);
            } catch {
                toast({
                    title: "Error loading shops",
                    variant: "destructive",
                });
            }
        });
    }

    async function handleDelete(id: string) {
        startTransition(async () => {
            const result = await deleteShop(id);
            if (result.success) {
                setShops((prev) => prev.filter((shop) => shop.id !== id));
                toast({
                    title: "✅ Shop Deleted",
                    description: "Shop deleted successfully.",
                });
            } else {
                toast({
                    title: "Failed to Delete Shop",
                    description: result.error || "An unknown error occurred.",
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Manage Shops</h2>
                <PermissionButton
                    onClick={() => setOpen(true)}
                    permission="Shops.Create"
                    className="bg-cyan-500"
                >
                    + Add Shop
                </PermissionButton>
            </div>

            {isPending && <LoadingPage />}

            {/* DataTable */}
            <DataTable
                data={shops}
                columns={[
                    { key: "name", label: "Shop Name" },
                    { key: "user", label: "Owner Name" },
                    { key: "subscriptionStartDate", label: "Subscription Start Date" },
                    { key: "subscriptionEndDate", label: "Subscription End Date" },
                    {
                        key: "isActive",
                        label: "Status",
                        render: (shop) => (shop.isActive ? "Active" : "Inactive"),
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-right",
                        render: (shop) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Shops.Update"
                                    onClick={() => {
                                        setEditingShop(shop);
                                        setOpen(true);
                                    }}
                                >
                                    Edit
                                </PermissionButton>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <PermissionButton
                                            size="sm"
                                            variant="destructive"
                                            permission="Shops.Delete"
                                        >
                                            Delete
                                        </PermissionButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently remove <strong>{shop.name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(shop.id)}
                                                className="bg-destructive text-white hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        ),
                    },
                ]}
            />
            <ShopFormDialog
                open={open}
                setOpen={setOpen}
                onSubmit={
                    editingShop ? (data) => handleUpdate(editingShop.id, data) : handleCreate
                }
                shop={editingShop}
                users={initialUser}
            />

            {/* ✅ ShadCN Pagination */}
            <div className="flex justify-end pt-4">
                <AppPagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
