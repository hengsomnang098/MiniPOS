"use client"
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
import { Categories } from "@/types/category"
import { createCategory, deleteCategory, getCategoryByShop, updateCategory } from "@/app/actions/categoryAction"
import CategoriesFormDialog from "./CategoriesFormDialog"
import { PageResult } from "@/types/pageResult"
import { useParamsStore } from "@/hooks/useParamStore"
import { useShallow } from "zustand/shallow";
import { AppSearch } from "@/components/AppSearch"
import AppPagination from "@/components/AppPagination"

interface CategoriesListProps {
    initialCategories: PageResult<Categories>
    shopId: string
}

export default function CategoriesList({
    initialCategories, shopId }: CategoriesListProps) {

    const [categories, setCategories] = useState(initialCategories.items);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Categories | null>(null);
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
            pageNumber: initialCategories.pageNumber,
            pageSize: initialCategories.pageSize,
            totalPages: initialCategories.totalPages,
        });
    }, [initialCategories, setParams]);

    async function refreshPage(page = pageNumber, term = search || "") {
        const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""}`;
        const result = await getCategoryByShop(query, shopId);

        if (!result || result.isSuccess === false) {
            toast({
                title: "Error loading users",
                description: "Failed to refresh user list.",
                variant: "destructive",
            });
            return;
        }

        setCategories(result.items);
        setParams({
            pageNumber: result.pageNumber,
            totalPages: result.totalPages,
        });
    }

    async function handleCreate(data: Partial<Categories>) {
        data.shopId = shopId;
        const result = await createCategory(data);
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
                setCategories((prev) => {
                    const updated = [result, ...prev];
                    return updated.length > pageSize ? updated.slice(0, pageSize) : updated;
                });
            } else {
                // 🌐 If not on first page, just refetch
                await refreshPage(pageNumber);
            }

            // Recalculate total pages if needed
            const newTotalPages = categories.length + 1 > pageSize * totalPages ? totalPages + 1 : totalPages;
            setParams({ totalPages: newTotalPages });
        });

        toast({ title: "Category Created", description: `${result.categoryName} created.` });
    }

    async function handleUpdate(id: string, data: Partial<Categories>) {
        data.shopId = shopId;
        const result = await updateCategory(id, { ...data, id });
        startTransition(async () => {

            if (result && !('error' in result)) {
                setCategories((prev) =>
                    prev.map((cat) => (cat.id === id ? result : cat))
                );
                toast({
                    title: "✅ Category Updated",
                    description: `${result.categoryName} updated successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Update Category",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }

    async function handleDelete(id: string) {
        const result = await deleteCategory(id);
        if (result.validationErrors || result.errors) {
            toast({
                title: "Failed to Delete User",
                description: result.validationErrors?.join(", ") || result.errors || "An error occurred.",
                variant: "destructive",
            });
            return;
        }
        startTransition(async () => {
            const remaining = categories.filter((category) => category.id !== id);
            setCategories(remaining);

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

          toast({ title: "Category Deleted", description: `Category has been deleted.` });
    }

    // 🔍 SEARCH
    async function handleSearch(term: string) {
        setParams({ search: term, pageNumber: 1 });
        await refreshPage(1, term);
    }

    // 📄 PAGINATION
async function handlePageChange(newPage: number) {
    startTransition(async () => {
        // Update the Zustand store immediately
        setParams({ pageNumber: newPage });

        // Fetch new page data
        await refreshPage(newPage);
    });
}



    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">All Categories</h2>
                <PermissionButton
                    permission="Categories.Create"
                    className="bg-cyan-500"
                    onClick={() => {
                        setEditingCategory(null);
                        setOpen(true);
                    }}
                >
                    + Add Category
                </PermissionButton>
            </div>

            {/* Search */}
            <AppSearch
                placeholder="Search by name or email..."
                onSearch={handleSearch}
                defaultValue={search}
                className="max-w-md"
            />

            {isPending && <LoadingPage />}

            <DataTable
                data={categories}
                columns={[
                    { key: "categoryName", label: "Category Name", },
                    { key: "shop", label: "Shop Name ", },
                    {
                        key: "actions",
                        label: "Actions",
                        className: "text-right",
                        render: (category) => (
                            <div className="space-x-2 text-right">
                                <PermissionButton
                                    size="sm"
                                    variant="outline"
                                    permission="Roles.Update"
                                    className="bg-yellow-500 hover:bg-yellow-300"
                                    onClick={() => {
                                        setEditingCategory(category);
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
                                            permission="Roles.Delete"
                                        >
                                            Delete
                                        </PermissionButton>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Permanently remove <strong>{(category).categoryName}</strong>?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(category.id)}
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

            <CategoriesFormDialog
                open={open}
                setOpen={setOpen}
                category={editingCategory}
                onSubmit={async (data: Partial<Categories>) => {
                    if (editingCategory) {
                        await handleUpdate(editingCategory.id, data);
                    } else {
                        await handleCreate(data);
                    }
                }}
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
