'use server';

import { FetchWrapper } from "@/lib/fetchWrapper";
import { Roles } from "@/types/role";
import { redirect } from "next/navigation";

const base = "/api/role";

export async function getRoles(): Promise<Roles[]> {
    try {
        const res = await FetchWrapper.get(base);
        if (res?.redirectTo) {
            redirect(res.redirectTo);
        }
        if (res?.error) {
            console.error("❌ Error fetching roles:", res.error.message);
            return [];
        }
        return res?.data ?? res ?? [];
    }
    catch (error: any) {
        // If this is a redirect, rethrow so Next.js can handle it
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
            throw error;
        }

        console.error("Error fetching users:", error);
        throw error;
    }
}
