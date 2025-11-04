"use server";

import { FetchWrapper } from "@/lib/fetchWrapper";
import { PageResult } from "@/types/pageResult";
import { OrderCreate, OrderDto } from "@/types/order";

const baseUrl = "/api/Order";

// Create a new order
export async function createOrder(payload: OrderCreate): Promise<OrderDto | any> {
  try {
    return await FetchWrapper.post(baseUrl, payload);
  } catch (error: any) {
    return formatError(error);
  }
}

// Get an order by id
export async function getOrder(id: string): Promise<OrderDto | any> {
  try {
    return await FetchWrapper.getById(baseUrl, id);
  } catch (error: any) {
    return formatError(error);
  }
}

// Get orders by shop (paginated)
export async function getOrdersByShop(query: string, shopId: string): Promise<PageResult<OrderDto>> {
  const normalizedQuery = query.startsWith("?") ? query.substring(1) : query;

  try {
    const res = await FetchWrapper.get(`${baseUrl}/shop/${shopId}?${normalizedQuery}`);
    return res as PageResult<OrderDto>;
  } catch (error: any) {
    return {
      isSuccess: false,
      items: [],
      pageCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      errors: [error.message],
    } as PageResult<OrderDto>;
  }
}

// Cancel an order
export async function cancelOrder(id: string): Promise<any> {
  try {
    return await FetchWrapper.put(`${baseUrl}/${id}/cancel`);
  } catch (error: any) {
    return formatError(error);
  }
}

function formatError(error: any) {
  if (error?.code === "ValidationError") {
    return {
      success: false,
      validationErrors: error.validationErrors,
      error: error.message,
    };
  }
  return { success: false, error: error?.message || "Unexpected error" };
}
