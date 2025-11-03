'use client'
import { PermissionButton } from "@/components/permissionButton/PermissionButton"
import LoadingPage from "../loading"
import { useEffect, useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
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
import { DataTable } from "@/components/DataTable"
import { Services } from "@/types/service"
import { Categories } from "@/types/category"
import { createService, deleteService, getServices, updateService } from "@/app/actions/servicesAction"
import ServiceFormDialog from "./ServiceFormDialog"
import { PageResult } from "@/types/pageResult"
import { useParamsStore } from "@/hooks/useParamStore"
import { useShallow } from "zustand/shallow";
import { AppSearch } from "@/components/AppSearch"
import AppPagination from "@/components/AppPagination"

interface ServicesListProps {
    initialServices: PageResult<Services>
    initialCategories: Categories[]
    shopId: string;
}

export default function ServicesList({ initialServices, initialCategories, shopId }: ServicesListProps) {
    const [services, setServices] = useState(initialServices.items);
    const [open, setOpen] = useState(false);
    const [editingService, setEditingService] = useState<Services | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const { pageNumber, pageSize, totalPages, search, setParams } = useParamsStore(
        useShallow((state) => ({
            pageNumber: state.pageNumber,
            pageSize: state.pageSize,
            totalPages: state.totalPages,
            search: state.search,
            setParams: state.setParams,
        }))
    );

    // Initialize pagination from server
    useEffect(() => {
        setParams({
            pageNumber: initialServices.pageNumber,
            pageSize: initialServices.pageSize,
            totalPages: initialServices.totalPages,
        });
    }, [initialServices, setParams]);

    async function refreshPage(page = pageNumber, term = search || "") {
        const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""}`;
        const result = await getServices(query, shopId);

        if (!result || result.isSuccess === false) {
            toast({
                title: "Error loading users",
                description: "Failed to refresh user list.",
                variant: "destructive",
            });
            return;
        }

        setServices(result.items);
        setParams({
            pageNumber: result.pageNumber,
            totalPages: result.totalPages,
        });
    }

    async function handleCreate(data: Partial<Services>) {
        const result = await createService(data);
        if (result.success === false) {
            toast({
                title: "Failed to Create User",
                description: result.error || result.validationErrors?.join(", ") || "An error occurred.",
                variant: "destructive",
            });
            return;
        }
        startTransition(async () => {
            if (pageNumber === 1) {
                // 🧠 Prepend locally for instant update
                setServices((prev) => {
                    const updated = [result, ...prev];
                    return updated.length > pageSize ? updated.slice(0, pageSize) : updated;
                });
            } else {
                // 🌐 If not on first page, just refetch
                await refreshPage(pageNumber);
            }

            // Recalculate total pages if needed
            const newTotalPages = services.length + 1 > pageSize * totalPages ? totalPages + 1 : totalPages;
            setParams({ totalPages: newTotalPages });
        });

        toast({ title: "Services Created", description: `${result.name} created.` });
    }

    async function handleUpdate(id: string, data: Partial<Services>) {
        const result = await updateService(id, { ...data, id });
        startTransition(async () => {

            if (result && !('error' in result)) {
                setServices((prev) => prev.map((service) => service.id === id ? result : service));
                toast({
                    title: "✅ Service Updated",
                    description: `${result.name} updated successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Update Service",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }

    async function handleDelete(id: string) {
        const result = await deleteService(id);
        if (result.validationErrors || result.errors) {
            toast({
                title: "Failed to Delete User",
                description: result.validationErrors?.join(", ") || result.errors || "An error occurred.",
                variant: "destructive",
            });
            return;
        }

        startTransition(async () => {
            const remaining = services.filter((service) => service.id !== id);
            setServices(remaining);

            // If last item on page deleted → move one page back
            if (remaining.length === 0 && pageNumber > 1) {
                setParams({ pageNumber: pageNumber - 1 });
                await refreshPage(pageNumber - 1);
            }
            // If deleted last on last page → adjust total pages
            else if (remaining.length === 0 && totalPages > 1 && pageNumber === totalPages) {
                setParams({ totalPages: totalPages - 1 });
            }
            // Else if list got shorter but not empty → just stay and show local change
        });

        toast({ title: "Service Deleted", description: `Service has been deleted.` });
    }

    // 🔍 SEARCH
    async function handleSearch(term: string) {
        setParams({ search: term, pageNumber: 1 });
        await refreshPage(1, term);
    }

    // 📄 PAGINATION
    async function handlePageChange(newPage: number) {
        setParams({ pageNumber: newPage });
        await refreshPage(newPage);
    }


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center" >
                <h2 className="text-lg font-medium">All Categories</h2>
                <PermissionButton
                    permission="Services.Create"
                    className="bg-cyan-500"
                    onClick={() => {
                        setEditingService(null);
                        setOpen(true);
                    }}
                >
                    + Add Service
                </PermissionButton>
            </div >

            {isPending && <LoadingPage />}

            {/* Search */}
            <AppSearch
                placeholder="Search by name or email..."
                onSearch={handleSearch}
                defaultValue={search}
                className="max-w-md"
            />

            <DataTable
                data={services}
                columns={[
                    { key: "name", label: "Service Name" },
                    { key: "category", label: "Category Name" },
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-right",
                        render: (services) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Services.Update"
                                    className="bg-yellow-500 hover:bg-yellow-300"
                                    onClick={() => {
                                        setEditingService(services);
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
                                            permission="Services.Delete"
                                        >
                                            Delete
                                        </PermissionButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently remove <strong>{(services).name}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(services.id)}
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

            <ServiceFormDialog
                open={open}
                setOpen={setOpen}
                onSubmit={editingService ? (data) => handleUpdate(editingService.id, data) : handleCreate}
                service={editingService}
                categories={initialCategories}
            />

            {/* Pagination */}
            <div className="flex justify-end pt-4">
                <AppPagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    )
}
