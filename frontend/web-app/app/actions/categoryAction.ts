"use server"
import { FetchWrapper } from "@/lib/fetchWrapper";
import { Categories } from "@/types/category";

const baseUrl = "/api/categories";

export async function getCategoryByShop(shopId: string) {
    try {
        return await FetchWrapper.get(`${baseUrl}/shop/${shopId}`);
    } catch (error :any) {
        console.error("Get categories by shop error:", error);
        return { isSuccess: false, data: [], message: error.message || "Failed to load categories." };
    }
}

export async function getCategory(id: string) {
    try {
        return await FetchWrapper.getById(baseUrl, id);
    } catch (error :any) {
        console.error("Get category error:", error);
        return { id: "", name: "", shopId: "", success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function createCategory(data: Partial<Categories>) {
    try {
        console.log(data)
        return await FetchWrapper.post(baseUrl, data);
    } catch (error: any) {
        console.error("Create category error:", error);
        return { id: "", name: "", shopId: "", success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function updateCategory(id: string, category: Partial<Categories>) {
    try {
        
        const res= await FetchWrapper.put(`${baseUrl}/${id}`, category);
        console.log(res);
        return res;
    } catch (error: any) {
        console.error("Update category error:", error);
        return { id: "", name: "", shopId: "", success: false, error: error.message || "An unexpected error occurred." };
    }
}

export async function deleteCategory(id: string) {
    try {
         await FetchWrapper.del(`${baseUrl}/${id}`);
         return { success: true };
    } catch (error: any) {
        console.error("Delete category error:", error);
        return { success: false, message: error.message || "An unexpected error occurred." };
    }
}
