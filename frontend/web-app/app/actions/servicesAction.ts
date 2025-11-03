"use server"
import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import { Services } from "@/types/service";

const baseUrl = "/api/Service";


export async function getServices(query: string, shopId: string): Promise<PageResult<Services>> {
    try {
        const normalizedQuery = query.startsWith("?") ? query : `?${query}`;
        const res = await FetchWrapper.get(`${baseUrl}/shop/${shopId}${normalizedQuery}`);
        return res;
    } catch (error: any)  {
        console.error("Get service error",error)
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

export async function getServicesByCategory(categoryId: string): Promise<Services[]> {
    try {
        const res = await FetchWrapper.get(`${baseUrl}/${categoryId}/list`);
        return res;
    } catch (error: any) {
        console.error("Get services by category error:", error);
        return [];
    }
}

export async function getService(id: string): Promise<Services & { success: boolean; error?: string }> {
    try {
        return await FetchWrapper.getById(baseUrl, id);
    } catch (error: any) {
        console.error("Get service error:", error);
        return {
            id: "",
            name: "",
            categoryId: "",
            category: [],
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}

export async function createService(data: Partial<Services>) {
    try {
        return await FetchWrapper.post(baseUrl, data);
    } catch (error: any) {
        console.error("Create service error:", error);
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

export async function updateService(id: string, service: Partial<Services>) {
    try {
        return await FetchWrapper.put(`${baseUrl}/${id}`, service);
    } catch (error: any) {
        console.error("Update service error:", error);
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

export async function deleteService(id: string) {
    try {
        return await FetchWrapper.del(`${baseUrl}/${id}`);
    } catch (error: any) {
        console.error("Delete service error:", error);
        return {
            success: false,
            error: error?.message || "An unexpected error occurred.",
        };
    }
}