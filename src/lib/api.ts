"use client";

import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

console.log("[API] Initializing API client");
console.log("[API] Base URL:", API_BASE_URL);
console.log("[API] Environment:", process.env.NODE_ENV);

// Force a visible log that can't be missed
if (typeof window !== 'undefined') {
    console.warn("🔵 API CLIENT INITIALIZED - Base URL:", API_BASE_URL);
}

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Log all requests
api.interceptors.request.use(
    (config) => {
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log(`[API] ========== REQUEST ==========`);
        console.log(`[API] Method: ${config.method?.toUpperCase()}`);
        console.log(`[API] URL: ${config.url}`);
        console.log(`[API] Full URL: ${fullUrl}`);
        console.log(`[API] Base URL: ${config.baseURL}`);
        console.log(`[API] withCredentials: ${config.withCredentials}`);
        console.log(`[API] Headers:`, config.headers.toJSON());

        if (typeof window !== 'undefined') {
            console.log(`[API] Origin: ${window.location.origin}`);
            console.log(`[API] All cookies:`, document.cookie || '(no cookies)');
        }
        console.log(`[API] ==============================`);
        return config;
    },
    (error) => {
        console.error("[API] Request interceptor error:", error);
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        console.log(`[API] ========== RESPONSE ==========`);
        console.log(`[API] Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
        console.log(`[API] Status: ${response.status}`);
        console.log(`[API] Headers:`, response.headers);
        console.log(`[API] ==================================`);
        return response;
    },
    async (error) => {
        console.error(`[API] ========== ERROR ==========`);
        console.error(`[API] Request: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
        console.error(`[API] Error code:`, error.code);
        console.error(`[API] Error message:`, error.message);
        console.error(`[API] Error status:`, error.response?.status);
        console.error(`[API] Error data:`, error.response?.data);
        console.error(`[API] Error headers:`, error.response?.headers);

        // Check if this is a CORS/Network error
        if (!error.response) {
            console.error(`[API] ⚠️  NO RESPONSE - This is likely a CORS or network connectivity issue`);
            console.error(`[API] ⚠️  The browser blocked the request or couldn't reach the server`);
            console.error(`[API] ⚠️  Check the Network tab for preflight OPTIONS requests`);
        }
        console.error(`[API] ================================`);

        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log("[API] 401 detected, attempting token refresh...");

            if (isRefreshing) {
                console.log("[API] Refresh already in progress, queuing request...");
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        console.log("[API] Retrying queued request after refresh");
                        return api.request(originalRequest);
                    })
                    .catch((err) => {
                        throw err;
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log("[API] Calling refresh token endpoint...");
                await api.post("/api/auth/refresh");
                console.log("[API] Token refresh successful");
                processQueue();
                console.log("[API] Retrying original request after refresh");
                return api.request(originalRequest);
            } catch (refreshError) {
                console.error("[API] Token refresh failed:", refreshError);
                processQueue(refreshError);
                globalThis.location.href = "/login";
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        throw error;
    }
);

export const fetcher = async (url: string) => {
    const response = await api.get(url);
    return response.data;
};
