"use client";

import { PermissionButton } from "@/components/permissionButton/PermissionButton";
import { useToast } from "@/components/ui/use-toast";
import { Shops } from "@/types/shop";
import { useState, useTransition } from "react";
import LoadingPage from "../loading";

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

import { createShop, deleteShop, updateShop } from "@/app/actions/shopAction";
import { Users } from "@/types/user";
import dynamic from "next/dynamic";

import { DataTable } from "@/components/DataTable";
// import { ShopFormDialog } from "./ShopFormDialog";

const ShopFormDialog = dynamic(() => import("./ShopFormDialog").then(m => m.ShopFormDialog), {
    ssr: false,
    loading: () => <LoadingPage />,
});

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
            const result = await createShop(data);

            if (!result.success) {
                // Validation failed or other error
                if (result.validationErrors) {
                    // Pass this to your form dialog to display
                    toast({
                        title: "Validation Error",
                        description: Object.values(result.validationErrors)
                            .flat()
                            .join(", "),
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to create shop",
                        variant: "destructive",
                    });
                }
                return;
            }

            // ✅ Success
            setShops((prev) => [...prev, result]);
            toast({
                title: "✅ Shop Created",
                description: `${result.name} added successfully.`,
            });
        });
    }


    async function handleUpdate(id: string, data: Partial<Shops>) {
        startTransition(async () => {
            try {
                const result = await updateShop(id, { ...data, id });
                if (result.success) {
                    toast({
                        title: "✅ Shop Updated",
                        description: `${data.name} updated successfully.`,
                    });
                    setEditingShop(null);
                } else {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to update shop",
                        variant: "destructive",
                    });
                    return;
                }

                setShops((prev) =>
                    prev.map((shop) => (shop.id === id ? { ...shop, ...data } : shop))
                );
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
                    description: result.error || "An unknown error occurred on delete shop.",
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
                        render: (shop) => ((shop as Shops).isActive ? "Active" : "Inactive"),
                    },
                    {
                        key: "asignedUsers",
                        label: "Asigned Users",
                        render: (shop) => (
                            <>
                                <PermissionButton
                                    size="sm"
                                    // variant="outline"
                                    permission="Shops.View"
                                    className="bg-blue-800 text-white hover:bg-blue-900 hover:text-white"
                                    href={`/dashboard/shops/${shop.id}`}
                                >
                                    Asign Users
                                </PermissionButton>
                            </>
                        )
                    },
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-center",
                        render: (shop) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Shops.Update"
                                    className="bg-yellow-500 hover:bg-yellow-300 text-white"
                                    onClick={() => {
                                        setEditingShop(shop as Shops);
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
                                                Permanently remove <strong>{(shop as Shops).name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete((shop as Shops).id)}
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
