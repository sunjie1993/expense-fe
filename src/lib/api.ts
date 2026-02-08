"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

console.log("=== API MODULE LOADED ===");
console.log("[API] Base URL:", API_BASE_URL);
console.log("[API] Environment:", process.env.NODE_ENV);

async function api(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;

    const fetchOptions: RequestInit = {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    console.log(`[API] ========== REQUEST ==========`);
    console.log(`[API] Method: ${options.method || 'GET'}`);
    console.log(`[API] URL: ${url}`);
    console.log(`[API] Options:`, fetchOptions);

    let response: Response;
    try {
        response = await fetch(url, fetchOptions);
        console.log(`[API] Response status: ${response.status}`);
    } catch (fetchError) {
        console.error(`[API] Fetch threw an error:`, fetchError);
        throw fetchError;
    }

    // Only attempt refresh if this ISN'T already an auth endpoint
    if (response.status === 401 && !endpoint.includes('/api/auth/')) {
        console.log("[API] 401 received, attempting refresh...");

        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (refreshResponse.ok) {
            console.log("[API] Refresh successful, retrying original request...");
            response = await fetch(url, fetchOptions);
        } else {
            console.log("[API] Refresh failed - auth context will handle redirect");
            // Don't redirect here - let auth context handle it
            // This prevents race conditions between api.ts and auth-context redirects
        }
    }

    return response;
}

// Convenience methods
export async function apiGet<T>(endpoint: string): Promise<T> {
    const response = await api(endpoint, { method: 'GET' });
    return response.json();
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
    console.log(`[apiPost] Called with endpoint: ${endpoint}`);
    console.log(`[apiPost] Body:`, body);

    const response = await api(endpoint, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    console.log(`[apiPost] Response data:`, data);
    return data;
}

export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await api(endpoint, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
    const response = await api(endpoint, { method: 'DELETE' });
    return response.json();
}

// For SWR
export const fetcher = async (url: string) => {
    const response = await api(url, { method: 'GET' });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

export { api, API_BASE_URL };
