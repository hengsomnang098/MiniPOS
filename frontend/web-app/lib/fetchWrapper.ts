// utils/fetch-wrapper.ts
import { auth } from "@/app/auth";

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Maps HTTP status codes to error codes
 */
function getErrorCodeFromStatus(status: number): string {
    switch (status) {
        case 400:
            return "BadRequest";
        case 401:
            return "Unauthorized";
        case 403:
            return "Forbidden";
        case 404:
            return "NotFound";
        case 409:
            return "Conflict";
        case 429:
            return "TooManyRequests";
        default:
            return "Failure";
    }
}

function isFormDataBody(body: any): boolean {
    if (!body) return false;
    if (body instanceof FormData) return true;
    return Object.values(body).some((v) => {
        if (typeof File !== "undefined" && v instanceof File) return true;
        if (typeof FileList !== "undefined" && v instanceof FileList && v.length > 0)
            return true;
        return false;
    });
}

async function getHeaders(isFormData = false): Promise<Headers> {
    const headers = new Headers();
    const session = await auth();

    if (!isFormData) {
        headers.set("Content-Type", "application/json");
    }

    if (session) {
        headers.set("Authorization", "Bearer " + session.accessToken);
    }

    return headers;
}

async function handleResponse(response: Response) {
    const text = await response.text();
    let data;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (response.ok) return data || response.statusText;

    // 🧠 Validation errors (ASP.NET, Laravel, etc.)
    if ((response.status === 400 || response.status === 422) && data?.errors) {
        return {
            success: false,
            code: "ValidationError",
            status: response.status,
            message: data?.title || "Validation failed",
            validationErrors: data.errors,
        };
    }

    // 🔒 Auth errors
    if (response.status === 401 || response.status === 403) {
        return {
            success: false,
            code: "Unauthorized",
            status: response.status,
            message: "Access denied or session expired",
            redirectTo: "/auth/login",
        };
    }

    // ❗ Generic failure
    return {
        success: false,
        code: getErrorCodeFromStatus(response.status),
        status: response.status,
        message: data?.message || data?.title || response.statusText,
    };


}

async function request(method: string, url: string, body?: any) {
    const hasFile = isFormDataBody(body);
    const headers = await getHeaders(hasFile);

    const options: RequestInit = { method, headers };

    if (body !== undefined && body !== null) {
        if (hasFile) {
            const formData = new FormData();
            for (const key in body) {
                const value = body[key];
                if (typeof File !== "undefined" && value instanceof File) {
                    formData.append(key, value);
                } else if (typeof FileList !== "undefined" && value instanceof FileList) {
                    if (value.length > 0) formData.append(key, value[0]);
                } else if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            }
            options.body = formData;
        } else {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(baseUrl + url, options);
        return await handleResponse(response);
    } catch (error: any) {
        console.error("Network or server error:", error);

        // 🚨 Return structured response instead of throwing
        if (
            error instanceof TypeError ||
            error?.code === "ECONNREFUSED" ||
            error?.message?.includes("Failed to fetch") ||
            error?.message?.includes("NetworkError") ||
            error?.message?.includes("Load failed")
        ) {
            return {
                success: false,
                code: "ServerUnavailable",
                status: 503,
                message: "Cannot connect to the server. Please try again later.",
            };
        }

        return {
            success: false,
            code: "Failure",
            status: 500,
            message: error?.message || "An unexpected server error occurred.",
        };

    }
}

/**
 * Exported FetchWrapper utility
 */
export const FetchWrapper = {
    get: (url: string) => request("GET", url),
    getById: (url: string, id: string | number) => request("GET", `${url}/${id}`),
    post: (url: string, body?: any) => request("POST", url, body),
    put: (url: string, body?: any) => request("PUT", url, body),
    del: (url: string) => request("DELETE", url),
};
