"use client";

import { PermissionButton } from "@/components/permissionButton/PermissionButton";
import { useToast } from "@/components/ui/use-toast";
import { Shops } from "@/types/shop";
import { useEffect, useState, useTransition } from "react";
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
import { createShop, deleteShop, getShops, updateShop } from "@/app/actions/shopAction";
import { Users } from "@/types/user";
import dynamic from "next/dynamic";
import { DataTable } from "@/components/DataTable";
import { useParamsStore } from "@/hooks/useParamStore";
import { useShallow } from "zustand/shallow";
import { AppSearch } from "@/components/AppSearch";

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
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [editingShop, setEditingShop] = useState<Shops | null>(null);

    // ✅ Zustand pagination store
    const { pageNumber, pageSize, totalPages, setParams, search } = useParamsStore(
        useShallow((state) => ({
            pageNumber: state.pageNumber,
            pageSize: state.pageSize,
            totalPages: state.totalPages,
            search: state.search,
            setParams: state.setParams,
        }))
    );

    // 🔍 Handle search
    async function handleSearch(term: string) {
        setParams({ search: term, pageNumber: 1 });
        await refreshPage(1, term);
    }


    // ✅ Initialize store on mount
    useEffect(() => {
        setParams({
            pageNumber: initialShops.pageNumber,
            pageSize: initialShops.pageSize,
            totalPages: initialShops.totalPages,
        });
    }, [initialShops, setParams]);

    // ✅ Helper: refresh page after CRUD
    async function refreshPage(page = pageNumber, term = search || "") {
        const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""
            }`;
        const result = await getShops(query);

        if (!result || result.isSuccess === false) {
            toast({
                title: "Error loading shops",
                description: "Failed to refresh shop list.",
                variant: "destructive",
            });
            return;
        }

        setShops(result.items);
        setParams({
            pageNumber: result.pageNumber,
            totalPages: result.totalPages,
        });
    }

    // ✅ Pagination
    async function handlePageChange(newPage: number) {
        startTransition(() => refreshPage(newPage));
    }

    // ✅ Create
    async function handleCreate(data: Partial<Shops>) {
        const result = await createShop(data);

        if (result.success === false) {
            toast({
                title: "Error",
                 description: result.error || result.validationErrors?.join(", ") || "An error occurred.",
                variant: "destructive",
            });
            return;
        }
        startTransition(async () => {
            if (pageNumber === 1) {
                // 🧠 Prepend locally for instant update
                setShops((prev) => {
                    const updated = [result, ...prev];
                    return updated.length > pageSize ? updated.slice(0, pageSize) : updated;
                });
            } else {
                // 🌐 If not on first page, just refetch
                await refreshPage(pageNumber);
            }

            // Recalculate total pages if needed
            const newTotalPages = shops.length + 1 > pageSize * totalPages ? totalPages + 1 : totalPages;
            setParams({ totalPages: newTotalPages });

        });

        toast({
            title: "✅ Shop Created",
            description: `${result.name} added successfully.`,
        });
    }

    // ✅ Update
    async function handleUpdate(id: string, data: Partial<Shops>) {
        startTransition(async () => {
            const result = await updateShop(id, { ...data, id });

            if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || result.validationErrors?.join(", ") || "An error occurred.",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "✅ Shop Updated",
                description: `${result.data.name} updated successfully.`,
            });

            setEditingShop(null);
            setShops((prev) => {
                return prev.map((shop) => (shop.id === id ? result.data : shop));
            });
        });
    }

    // ✅ Delete
    async function handleDelete(id: string) {
        const result = await deleteShop(id);
        if (result.validationErrors || result.errors) {
            toast({
                title: "Failed to Delete Shop",
                description: result.validationErrors?.join(", ") || result.errors || "An error occurred.",
                variant: "destructive",
            });
            return;
        }
        startTransition(async () => {
            const remaining = shops.filter((shop) => shop.id !== id);
            setShops(remaining);

            // If last item on page deleted → move one page back
            if (remaining.length === 0 && pageNumber > 1) {
                setParams({ pageNumber: pageNumber - 1 });
                await refreshPage(pageNumber - 1);
            }
            // If deleted last on last page → adjust total pages
            else if (remaining.length === 0 && totalPages > 1 && pageNumber === totalPages) {
                setParams({ totalPages: totalPages - 1 });
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

            {/* 🔍 Search */}
            <AppSearch
                placeholder="Search by Shop Name or Owner Name..."
                onSearch={handleSearch}
                defaultValue={search}
                className="max-w-md"
            />

            {isPending && <LoadingPage />}

            <DataTable
                data={shops}
                columns={[
                    { key: "name", label: "Shop Name" },
                    { key: "user", label: "Owner Name" },
                    {
                        key: "subscriptionStartDate", label: "Start Date",
                        render: (shop) => {
                            const startDate = (shop as Shops).subscriptionStartDate;
                            return startDate ? new Date(startDate).toLocaleDateString() : "N/A";
                        }
                    },
                    {
                        key: "subscriptionEndDate", label: "End Date",
                        render: (shop) => {
                            const endDate = (shop as Shops).subscriptionEndDate;
                            return endDate ? new Date(endDate).toLocaleDateString() : "N/A";
                        }
                    },
                    {
                        key: "isActive",
                        label: "Status",
                        render: (shop) => ((shop as Shops).isActive ? "Active" : "Inactive"),
                    },
                    {
                        key: "asignedUsers",
                        label: "Asigned Users",
                        render: (shop) => (
                            <PermissionButton
                                size="sm"
                                permission="Shops.View"
                                className="bg-blue-800 text-white hover:bg-blue-900 hover:text-white"
                                href={`/dashboard/shops/${shop.id}`}
                            >
                                Asign Users
                            </PermissionButton>
                        ),
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

            {/* ✅ Pagination */}
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
