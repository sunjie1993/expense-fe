"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
    accessToken = token;
}

export function getAccessToken(): string | null {
    return accessToken;
}

function getRefreshToken(): string | null {
    if (globalThis.sessionStorage === undefined) return null;
    return sessionStorage.getItem("refreshToken");
}

export function setRefreshToken(token: string | null) {
    if (globalThis.sessionStorage === undefined) return;
    if (token) {
        sessionStorage.setItem("refreshToken", token);
    } else {
        sessionStorage.removeItem("refreshToken");
    }
}

export function clearTokens() {
    accessToken = null;
    if (globalThis.sessionStorage !== undefined) {
        sessionStorage.removeItem("refreshToken");
    }
}

async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            accessToken = data.data.accessToken;
            return true;
        }
    } catch {
    }

    clearTokens();
    return false;
}

async function api(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const fetchOptions: RequestInit = {
        ...options,
        headers,
    };

    let response = await fetch(url, fetchOptions);

    if (response.status === 401 && !endpoint.includes("/api/auth/")) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            headers["Authorization"] = `Bearer ${accessToken}`;
            response = await fetch(url, { ...fetchOptions, headers });
        } else if (globalThis.location && !globalThis.location.pathname.includes("/login")) {
            globalThis.location.href = "/login/";
        }
    }

    return response;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
    const response = await api(endpoint, { method: "GET" });
    return response.json();
}

export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await api(endpoint, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
}

export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await api(endpoint, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
    });
    return response.json();
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
    const response = await api(endpoint, { method: "DELETE" });
    return response.json();
}

export const fetcher = async (url: string) => {
    const response = await api(url, { method: "GET" });
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    return response.json();
};

export { api, API_BASE_URL };
