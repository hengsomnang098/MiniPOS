"use client"
import { PermissionButton } from "@/components/permissionButton/PermissionButton"
import LoadingPage from "../loading"
import { useState, useTransition } from "react"
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
import { createCategory, deleteCategory, updateCategory } from "@/app/actions/categoryAction"
import CategoriesFormDialog from "./CategoriesFormDialog"

interface CategoriesListProps {
    initialCategories: Categories[]
    shopId: string
}

export default function CategoriesList({
    initialCategories, shopId }: CategoriesListProps) {

    const [categories, setCategories] = useState(initialCategories);
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Categories | null>(null);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    async function handleCreate(data: Partial<Categories>) {
        data.shopId = shopId;
        const result = await createCategory(data);
        startTransition(async () => {

            if (result && !('error' in result)) {
                setCategories((prev) => [...prev, result]);
                toast({
                    title: "✅ Category Created",
                    description: `${result.categoryName} added successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Create Category",
                    description: result.error || "An unexpected error occurred.",
                });
            }
        })
    }

    async function handleUpdate(id: string, data: Partial<Categories>) {
        data.shopId = shopId;
        const result = await updateCategory(id, {...data,id});
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
        startTransition(async () => {
            if (result && result.success) {
                setCategories((prev) => prev.filter((cat) => cat.id !== id));
                toast({
                    title: "✅ Category Deleted",
                    description: `Category deleted successfully.`,
                });
            } else {
                toast({
                    title: "Failed to Delete Category",
                    description: result.message || "An unexpected error occurred.",
                });
            }
        })
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
        </div>
    )
}
