"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { SalesByProductItem } from "@/types/report";

const baseUrl = "/api/Reports";

export async function getSalesByProduct(
  shopId: string,
  startDate: string,
  endDate: string
): Promise<SalesByProductItem[] | any> {
  try {
    const query = `?shopId=${shopId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    const res = await FetchWrapper.get(`${baseUrl}/sales-by-product${query}`);
    return res as SalesByProductItem[];
  } catch (error: any) {
    console.error("Get sales-by-product error:", error);
    return [];
  }
}

export async function exportSalesByProductCsv(
  shopId: string,
  startDate: string,
  endDate: string
): Promise<Blob | null> {
  try {
    const query = `?shopId=${shopId}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&format=csv`;
    // Use fetch directly to get blob (FetchWrapper parses JSON)
    const sessionHeaders = await (async () => {
      const { auth } = await import("@/app/auth");
      const session = await auth();
      const headers: HeadersInit = {};
      if (session) headers["Authorization"] = "Bearer " + session.accessToken;
      return headers;
    })();

  const base = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "";
    const resp = await fetch(`${base}${baseUrl}/sales-by-product/export${query}`, {
      method: "GET",
      headers: sessionHeaders,
    });
    if (!resp.ok) return null;
    return await resp.blob();
  } catch (error) {
    console.error("Export CSV error:", error);
    return null;
  }
}
