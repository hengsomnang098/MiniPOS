"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import {  Shops, } from "@/types/shop";

const baseUrl = "/api/shop";
const fetchWrapper = FetchWrapper;

export async function getShops(query:string): Promise<PageResult<Shops>> {
    try {
        return fetchWrapper.get(`${baseUrl}${query}`);
    } catch (error: any) {
        console.error("Get shops error:", error);
        return {
            items: [],
            pageCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
        };
    }
}

export async function getShop(id: string): Promise<Shops & { success: boolean; error?: string }> {
    try {
        return fetchWrapper.getById(baseUrl, id);
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

export async function createShop(data: Partial<Shops>): Promise<Shops & { success: boolean; error?: string }> {
    try {
        return fetchWrapper.post(baseUrl, data);
    } catch (error: any) {
        console.error("Create shop error:", error);
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

export async function updateShop(id: string, shop: Partial<Shops>): Promise<Shops & { success: boolean; error?: string }> {
    try {
        return fetchWrapper.put(`${baseUrl}/${id}`, shop);
    } catch (error: any) {
        console.error("Update shop error:", error);
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

export async function deleteShop(id: string): Promise<{ success: boolean; error?: string }> {   
    try {
        await fetchWrapper.del(`${baseUrl}/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Delete shop error:", error);
        return { success: false, error: error?.message || "An unexpected error occurred." };
    }
}
