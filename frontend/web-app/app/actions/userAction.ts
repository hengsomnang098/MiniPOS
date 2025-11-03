// app/dashboard/users/actions.ts
'use server';

import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import { Users } from "@/types/user";

const base = "/api/users";

export async function getAllUsers(): Promise<Users[]> {
  const res = await FetchWrapper.get(`${base}/alldata`);
  return res;
}


export async function getUsers(query: string): Promise<PageResult<Users>> {
  const normalizedQuery = query.startsWith("?") ? query : `?${query}`;
  const res = await FetchWrapper.get(`${base}${normalizedQuery}`);
  return res;
}

export async function createUser(data: Partial<Users>) {
  try {
    const res = await FetchWrapper.post(base, data);
    console.log(res)
    return res;
  } catch (error: any) {
    console.error("Create user error:", error);
    if (error.code === "ValidationError") {
      return {
        success: false,
        validationErrors: error.validationErrors,
        error: error.message,
      };
    }
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}

export async function updateUser(
  id: string,
  data: Partial<Users>
) {
  try {
    const res = await FetchWrapper.put(`${base}/${id}`, data);
    return { success: true, data: res?.data ?? res };
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "ValidationError") {
      return {
        success: false,
        validationErrors: error.validationErrors,
        error: error.errors,
      };
    }
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}

export async function deleteUser(id: string): Promise<any> {
  try {
    const res = await FetchWrapper.del(`${base}/${id}`);
    return res;

  } catch (error: any) {
    console.error("Delete user error:", error);
    if (error.code === "ValidationError") {
      return {
        success: false,
        validationErrors: error.validationErrors,
        error: error.errors,
      };
    }
    return { success: false, error: error?.message || "An unexpected error occurred." };
  }
}
