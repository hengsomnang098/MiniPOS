"use server"
import { FetchWrapper } from "@/lib/fetchWrapper";
import { Services } from "@/types/service";

const baseUrl = "/api/Service";

export async function getServices():Promise<Services[]> {
    try {
        const res= await FetchWrapper.get(baseUrl);
        return res;
    } catch (error:any) {
        console.error("Error fetching services:", error);
        throw new Error("Failed to fetch services");
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