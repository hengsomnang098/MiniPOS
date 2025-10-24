import { FetchWrapper } from "@/lib/fetchWrapper";
import { Roles } from "@/types/role";
import { Permissions } from "@/types/permission";

const baseUrl = "/api/role";
const fetchWrapper = FetchWrapper;

export async function getRoles(): Promise<Roles[]> {
  return fetchWrapper.get(baseUrl);
}

export async function getRole(id: string): Promise<Roles> {
  return fetchWrapper.get(`${baseUrl}/${id}`);
}

export async function createRole(role: { name: string; permissions: string[] }): Promise<Roles> {
  return fetchWrapper.post(baseUrl, role);
}

export async function updateRole(id: string, role: { name: string; permissions: string[] }): Promise<Roles> {
  return fetchWrapper.put(`${baseUrl}/${id}`, role);
}

export async function deleteRole(id: string): Promise<boolean> {
  return fetchWrapper.del(`${baseUrl}/${id}`);
}

export async function getAvailablePermissions(): Promise<Permissions[]> {
  return fetchWrapper.get(`${baseUrl}/permissions`);
}

export async function getRolePermissions(id: string): Promise<Permissions[]> {
  return fetchWrapper.get(`${baseUrl}/${id}/permissions`);
}