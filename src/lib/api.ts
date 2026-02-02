"use client";

import axios from "axios";
import { getSecureToken, removeSecureToken } from "@/lib/secure-storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getSecureToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            removeSecureToken();
            globalThis.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export const fetcher = async (url: string) => {
    const response = await api.get(url);
    return response.data;
};
