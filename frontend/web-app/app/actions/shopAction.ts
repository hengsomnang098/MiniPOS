"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import { Shops, } from "@/types/shop";


const baseUrl = "/api/shop";
const fetchWrapper = FetchWrapper;


export async function getShops(query: string): Promise<PageResult<Shops>> {
    try {
        // Ensure query starts with "?"
        const normalizedQuery = query.startsWith("?") ? query : `?${query}`;
        const res = await FetchWrapper.get(`${baseUrl}${normalizedQuery}`);
        return res as PageResult<Shops>;
    } catch (error: any) {
        console.error("Get shops error:", error);
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

export async function getShop(id: string): Promise<Shops & { success: boolean; error?: string }> {
    try {
        return await fetchWrapper.getById(baseUrl, id);
    } catch (error: any) {
        console.error("Get shop error:", error);
        return {
            id: "",
            name: "",
            userId: "",
            user: "",
            subscriptionStartDate: "",
            subscriptionEndDate: "",
            isActive: false,
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}

export async function createShop(data: Partial<Shops>) {
    try {
        const result = await fetchWrapper.post("/api/shop", data);
        return { ...result, success: true };
    } catch (error: any) {
        console.error("Create shop error:", error);

        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}

export async function updateShop(id: string, data: Partial<Shops>) {
    try {
        const result = await fetchWrapper.put(`/api/shop/${id}`, data);

        if (result?.success === false) return result;

        // ✅ Return backend DTO (already mapped in your C#)
        return {
            success: true,
            data: result?.data || result, // handle either pattern
        };
    } catch (error: any) {
        console.error("Update shop error:", error);
        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}



export async function deleteShop(id: string): Promise<any> {
    try {
        await await fetchWrapper.del(`${baseUrl}/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Create shop error:", error);

        if (error.code === "ValidationError") {
            return {
                success: false,
                validationErrors: error.validationErrors,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}
