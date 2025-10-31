"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";

const baseUrl = "/api/ShopUser";

export async function getShopUsers(shopId: string) {
    try {
        return await FetchWrapper.get(`${baseUrl}/${shopId}/users`);
    } catch (error) {
        console.error("Get shop users error:", error);
        return { isSuccess: false, data: [], message: "Failed to load shop users." };
    }
}

export async function getShopByUser(userId: string) {
    try{
        return await FetchWrapper.get(`${baseUrl}/user/${userId}`);
    } catch (error) {
        console.error("Get shop by user error:", error);
        return { isSuccess: false, data: null, message: "Failed to load shop for user." };
    }
}

export async function assignUsersToShop(
    shopId: string,
    userIds: string[]
): Promise<{ success: boolean; message: string; data: any[] }> {
    try {
        const res = await FetchWrapper.post(`${baseUrl}/${shopId}/assign`, {
            shopId,
            userId: userIds,
        });
        return {
            success: res?.isSuccess ?? true,
            message: res?.message || "Users assigned successfully.",
            data: res || [],
        };
    } catch (error: any) {
        console.error("Assign users to shop error:", error);
        return {
            success: false,
            message: error?.message || "An unexpected error occurred.",
            data: [],
        };
    }
}

export async function removeUserFromShop(
    shopId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const res = await FetchWrapper.del(`${baseUrl}/${shopId}/remove/${userId}`);
        return {
            success: res?.isSuccess ?? true,
            message: res?.message || "User removed successfully.",
        };
    } catch (error: any) {
        console.error("Remove user from shop error:", error);
        return {
            success: false,
            message: error?.message || "Unexpected error occurred.",
        };
    }
}
