// app/dashboard/users/actions.ts
'use server';

import { FetchWrapper } from "@/lib/fetchWrapper";
import { Users } from "@/types/user";

const base = "/api/users";

export async function getUsers(): Promise<Users[]> {
  const res = await FetchWrapper.get(base);
  return res?.data ?? res ?? [];
}

export async function createUser(data: Partial<Users>)
  : Promise<{ success: boolean; data?: Users; error?: string; validationErrors?: Record<string, string[]>; }> {
  const res = await FetchWrapper.post(base, data);
  return { success: true, data: res?.data ?? res };
}

export async function updateUser(id: string, data: Partial<Users>): Promise<Users | null> {
  const res = await FetchWrapper.put(`${base}/${id}`, data);
  return res?.data ?? res;
}

export async function deleteUser(id: string): Promise<boolean> {
  await FetchWrapper.del(`${base}/${id}`);
  return true;
}
