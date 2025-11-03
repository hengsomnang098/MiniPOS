"use server"
import { FetchWrapper } from "@/lib/fetchWrapper";
import { Categories } from "@/types/category";
import { PageResult } from "@/types/pageResult";

const baseUrl = "/api/categories";

export async function getAllCategories(shopId: string): Promise<Categories[]> {
    const res = await FetchWrapper.get(`${baseUrl}/shop/${shopId}/all`);
    return res;
}




export async function getCategoryByShop(query: string, shopId: string): Promise<PageResult<Categories>> {
    const normalizedQuery = query.startsWith("?") ? query : `?${query}`;
    try {
        const res = await FetchWrapper.get(`${baseUrl}/shop/${shopId}${normalizedQuery}`);
        return res as PageResult<Categories>;
    } catch (error: any) {
        console.error("Get categories by shop error:", error);
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

export async function getCategory(id: string) {
    try {
        return await FetchWrapper.getById(baseUrl, id);
    } catch (error: any) {
        console.error("Get category error:", error);
        return { id: "", name: "", shopId: "", success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function createCategory(data: Partial<Categories>) {
    try {
        return await FetchWrapper.post(baseUrl, data);
    } catch (error: any) {
        console.error("Create category error:", error);
        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        }
    }
}

export async function updateCategory(id: string, category: Partial<Categories>) {
    try {

        const res = await FetchWrapper.put(`${baseUrl}/${id}`, category);
        console.log(res);
        return res;
    } catch (error: any) {
        console.error("Update category error:", error);
        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        };
    }
}

export async function deleteCategory(id: string):Promise<any> {
    try {
        await FetchWrapper.del(`${baseUrl}/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Delete category error:", error);
        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        }
    }
}
