"use client";

import { useToast } from "@/components/ui/use-toast";
import { useParamsStore } from "@/hooks/useParamStore";
import { PageResult } from "@/types/pageResult";
import { Product } from "@/types/product";
import { useEffect, useState, useTransition } from "react";
import { useShallow } from "zustand/shallow";
import { AppSearch } from "@/components/AppSearch";
import {
  createProduct,
  getProductsByShop,
  updateProduct,
  deleteProduct,
} from "@/app/actions/productAction";
import { PermissionButton } from "@/components/permissionButton/PermissionButton";
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
import AppPagination from "@/components/AppPagination";
import Image from "next/image";
import { ProductFormDialog } from "./ProductFormDialog";
import { FieldValues } from "react-hook-form";

interface ProductsListProps {
  initialProducts: PageResult<Product>;
  shopId: string;
}

export default function ProductsList({ initialProducts, shopId }: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts.items);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { pageNumber, pageSize, totalPages, setParams, search } = useParamsStore(
    useShallow((state) => ({
      pageNumber: state.pageNumber,
      pageSize: state.pageSize,
      totalPages: state.totalPages,
      search: state.search,
      setParams: state.setParams,
    }))
  );

  // ✅ Refresh product list after any CRUD
  async function refreshPage(page = pageNumber, term = search || "") {
    const query = `?page=${page}&pageSize=${pageSize}${term ? `&search=${encodeURIComponent(term)}` : ""
      }`;
    const result = await getProductsByShop(query, shopId);

    if (!result || result.isSuccess === false) {
      toast({
        title: "Error loading products",
        description: "Failed to refresh product list.",
        variant: "destructive",
      });
      return;
    }

    setProducts(result.items);
    setParams({
      pageNumber: result.pageNumber,
      totalPages: result.totalPages,
    });
  }

  // 🔍 Handle search
  async function handleSearch(term: string) {
    setParams({ search: term, pageNumber: 1 });
    await refreshPage(1, term);
  }

  // ✅ Initialize pagination store
  useEffect(() => {
    setParams({
      pageNumber: initialProducts.pageNumber,
      pageSize: initialProducts.pageSize,
      totalPages: initialProducts.totalPages,
    });
  }, [initialProducts, setParams]);

  // ✅ Pagination
  async function handlePageChange(newPage: number) {
    startTransition(() => refreshPage(newPage));
  }

  // ➕ CREATE
  async function handleCreate(data: FieldValues) {
    const result = await createProduct(data);

    if (result?.success === false) {
      toast({
        title: "Failed to create product",
        description: result.error || "Please check your inputs.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Created",
      description: "The new product has been added successfully.",
    });

    await refreshPage();
  }

  // ✏️ UPDATE
  async function handleUpdate(id: string, data: FieldValues) {
    const result = await updateProduct(id, data);

    if (result?.success === false) {
      toast({
        title: "Failed to update product",
        description: result.error || "Something went wrong.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Updated",
      description: "Changes have been saved successfully.",
    });

    await refreshPage();
  }

  // ❌ DELETE
  async function handleDelete(id: string) {
    const result = await deleteProduct(id);

    if (result?.success === false) {
      toast({
        title: "Delete Failed",
        description: result.error || "Could not delete the product.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Deleted",
      description: "The product was removed successfully.",
    });

    await refreshPage();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Manage Products</h2>
        <PermissionButton
          onClick={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
          permission="Products.Create"
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          + Add Product
        </PermissionButton>
      </div>

      {/* Search */}
      <AppSearch
        placeholder="Search products..."
        onSearch={handleSearch}
        defaultValue={search}
        className="max-w-md"
      />

      {/* Loading State */}
      {isPending && <LoadingPage />}

      {/* Table */}
      <DataTable
        data={products}
        columns={[
          { key: "name", label: "Product Name" },
          { key: "description", label: "Description" },
          { key: "categoryName", label: "Category" },
          { key: "serviceName", label: "Service Name" },
          { key: "quantity", label: "Quantity" },
          { key: "price", label: "Price Sell" },
          { key: "costPrice", label: "Price Cost" },
          {
            key: "imageUrl",
            label: "Image",
            render: (product) => (
              <Image
                src={product.imageUrl || "/Images/placeholder.png"}
                alt={product.name || "Product"}
                width={90}
                height={90}
                className="object-cover rounded-md border"
                loading="lazy"
                placeholder="blur"
                blurDataURL="/images/placeholder.png"
              />
            ),
          },
          {
            key: "isActive",
            label: "Status",
            render: (product) => (
              <span
                className={`px-2 py-1 text-xs rounded ${product.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            className: "text-center",
            render: (product) => (
              <div className="flex justify-center gap-2">
                <PermissionButton
                  size="sm"
                  variant="outline"
                  permission="Products.Update"
                  className="bg-yellow-500 hover:bg-yellow-400 text-white"
                  onClick={() => {
                    setEditingProduct(product);
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
                      permission="Products.Delete"
                    >
                      Delete
                    </PermissionButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Permanently remove{" "}
                        <strong>{product.name}</strong>?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
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

      {/* 🧾 Product Dialog */}
      <ProductFormDialog
        open={open}
        setOpen={setOpen}
        onSubmit={
          editingProduct
            ? (data) => handleUpdate(editingProduct.id, data)
            : handleCreate
        }
        product={editingProduct}
        shopId={shopId}
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
  );
}
