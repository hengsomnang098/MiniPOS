// app/dashboard/users/actions.ts
'use server';

import { FetchWrapper } from "@/lib/fetchWrapper";
import { Users } from "@/types/user";
import { redirect } from "next/navigation";

const base = "/api/users";

export async function getUsers(): Promise<Users[]> {
  try {
    const res = await FetchWrapper.get(base);
    if (res?.redirectTo) {
      redirect(res.redirectTo);
    }
    return res?.data ?? res ?? [];
  } catch (error: any) {
    // If this is a redirect, rethrow so Next.js can handle it
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function createUser(
  data: Partial<Users>
): Promise<{
  success: boolean;
  data?: Users;
  error?: string;
  validationErrors?: Record<string, string[]>;
}> {
  try {
    const res = await FetchWrapper.post(base, data);
    return { success: true, data: res?.data ?? res };
  } catch (error: any) {
    console.error("❌ Error creating user:", error);

    // Handle structured error (like validation)
    if (error.status === 422 && error.message?.errors) {
      return { success: false, validationErrors: error.message.errors };
    }

    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}

export async function updateUser(id: string, data: Partial<Users>): Promise<Users | null> {
  try {
    const res = await FetchWrapper.put(`${base}/${id}`, data);
    return res?.data ?? res;
  } catch (error: any) {
    console.error("❌ Error updating user:", error);
    return null;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await FetchWrapper.del(`${base}/${id}`);
    return true;
  } catch (error: any) {
    console.error("❌ Error deleting user:", error);
    return false;
  }
}
