// app/dashboard/users/actions.ts
'use server';

import { FetchWrapper } from "@/lib/fetchWrapper";
import { Users } from "@/types/user";

const base = "/api/users";

export async function getUsers(): Promise<Users[] | { success: boolean; error?: string }> {
  try {
    const res = await FetchWrapper.get(base);
    return res?.data ?? res ?? [];
  } catch (error: any) {
    console.error("Get users error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}

export async function createUser(data: Partial<Users>)
  : Promise<{ success: boolean; data?: Users; error?: string; validationErrors?: Record<string, string[]>; }> {
  try {
    const res = await FetchWrapper.post(base, data);
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Create user error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}

export async function updateUser(
  id: string,
  data: Partial<Users>
): Promise<{ success: boolean; data?: Users; error?: string; validationErrors?: Record<string, string[]> }> {
  try {
    const res = await FetchWrapper.put(`${base}/${id}`, data);
    return { success: true, data: res?.data ?? res };
  } catch (error: any) {
    console.error("Update user error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await FetchWrapper.del(`${base}/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete user error:", error);
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}
