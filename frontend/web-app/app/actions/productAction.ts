"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import { Product } from "@/types/product";
import { FieldValues } from "react-hook-form";

const baseUrl = "/api/Product"; // ✅ matches [Route("api/[controller]")] in backend

// 🧾 Get all products for a shop (paginated)
export async function getProductsByShop(query: string, shopId: string): Promise<PageResult<Product>> {
    // ✅ Remove duplicate '?' and avoid accidental double query params
    const normalizedQuery = query.startsWith("?") ? query.substring(1) : query;

    try {
        const res = await FetchWrapper.get(`${baseUrl}?shopId=${shopId}&${normalizedQuery}`);
        return res as PageResult<Product>;
    } catch (error: any) {
        console.error("❌ Get products by shop error:", error);
        return {
            isSuccess: false,
            items: [],
            pageCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
            errors: [error.message],
        };
    }
}

// 🔍 Get single product by id
export async function getProduct(id: string): Promise<Product | any> {
    try {
        return await FetchWrapper.getById(baseUrl, id);
    } catch (error: any) {
        console.error("❌ Get product error:", error);
        return {
            success: false,
            error: error.message || "An unexpected error occurred.",
        };
    }
}

// ➕ Create product (multipart/form-data)
export async function createProduct(data: FieldValues): Promise<any> {
    try {
        // ✅ Explicitly set multipart headers (if FetchWrapper doesn’t auto-handle)
        return await FetchWrapper.post(baseUrl, data);
    } catch (error: any) {
        console.error("❌ Create product error:", error);
        return formatError(error);
    }
}

// ✏️ Update product (multipart/form-data)
export async function updateProduct(id: string, data: FieldValues): Promise<any> {
    try {
        return await FetchWrapper.put(`${baseUrl}/${id}`, data);
    } catch (error: any) {
        console.error("❌ Update product error:", error);
        return formatError(error);
    }
}

// ❌ Delete product
export async function deleteProduct(id: string): Promise<any> {
    try {
        await FetchWrapper.del(`${baseUrl}/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("❌ Delete product error:", error);
        return formatError(error);
    }
}

// 🧩 Common error handler
function formatError(error: any) {
    if (error.code === "ValidationError") {
        return {
            success: false,
            validationErrors: error.validationErrors,
            error: error.message,
        };
    }
    return { success: false, error: error.message || "Unexpected error" };
}
