"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { Roles } from "@/types/role";
import { Permissions } from "@/types/permission";
const baseUrl = "/api/role";
const fetchWrapper = FetchWrapper;

export async function getRoles(): Promise<Roles[]> {
  try {
    return await fetchWrapper.get(baseUrl);
  }
  catch (error: any) {
    console.error("Delete role error:", error);
    return [];
  }
}

export async function getRole(id: string): Promise<Roles & { success: boolean; error?: string }> {
  try {
    return await fetchWrapper.getById(baseUrl, id);
  } catch (error: any) {
    console.error("Get role error:", error);
    return {
      id: "",
      name: "",
      permissionIds: [],
      success: false,
      error: error?.message || "An unexpected error occurred.",
    };
  }
}

export async function createRole(data: Partial<Roles>) {
  try {
    return await fetchWrapper.post(baseUrl, data);
  } catch (error: any) {
    console.error("Create role error:", error);
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

export async function updateRole(id: string, role: Partial<Roles>) {
  try {
    return await fetchWrapper.put(`${baseUrl}/${id}`, role);
  } catch (error: any) {
    console.error("Update role error:", error);
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

export async function deleteRole(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fetchWrapper.del(`${baseUrl}/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete role error:", error);
    return {
      success: false,
      error: error?.message || "An unexpected error occurred.",
    };
  }
}

export async function getAvailablePermissions(): Promise<Permissions[]> {
  return fetchWrapper.get(`${baseUrl}/permissions`);
}

export async function getRolePermissions(id: string): Promise<Permissions[]> {
  return fetchWrapper.get(`${baseUrl}/${id}/permissions`);
}