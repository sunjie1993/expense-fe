"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {api} from "@/lib/api";
import type {ApiResponse, LoginResponse} from "@/types/api";
import {migrateLegacyToken} from "@/lib/secure-storage";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (passcode: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: Readonly<{ children: ReactNode }>) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        migrateLegacyToken();

        const checkAuth = async () => {
            try {
                console.log("[Auth] Checking authentication...");
                console.log("[Auth] API Base URL:", api.defaults.baseURL);
                console.log("[Auth] withCredentials:", api.defaults.withCredentials);

                // Use a protected endpoint to verify authentication
                // Using limit=1 for efficiency - we only need to know if auth is valid
                const response = await api.get("/api/expenses?limit=1");
                console.log("[Auth] Check auth success:", response.status);
                setIsAuthenticated(true);
            } catch (error: unknown) {
                console.error("[Auth] Check auth failed:", error);
                if (error instanceof Error) {
                    console.error("[Auth] Error message:", error.message);
                }
                if (typeof error === 'object' && error && 'response' in error) {
                    const axiosError = error as { response?: { status?: number; data?: unknown } };
                    console.error("[Auth] Response status:", axiosError.response?.status);
                    console.error("[Auth] Response data:", axiosError.response?.data);
                }
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        void checkAuth();
    }, []);

    const login = useCallback(async (passcode: string) => {
        console.warn("🟢 LOGIN FUNCTION CALLED");
        console.log("[Auth] Login attempt...");
        console.log("[Auth] API Base URL:", api.defaults.baseURL);
        console.log("[Auth] withCredentials:", api.defaults.withCredentials);

        const response = await api.post<ApiResponse<LoginResponse>>(
            "/api/auth/login",
            {passcode}
        );

        console.log("[Auth] Login response status:", response.status);
        console.log("[Auth] Login response data:", response.data);
        console.log("[Auth] Login response headers:", response.headers);
        console.log("[Auth] Set-Cookie headers:", response.headers['set-cookie']);
        if (typeof document !== 'undefined') {
            console.log("[Auth] Browser cookies after login:", document.cookie || '(no cookies)');
        }

        if (!response.data.success) {
            console.error("[Auth] Login failed - success is false");
            setIsAuthenticated(false);
            throw new Error("Login failed");
        }

        console.log("[Auth] Login successful");
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsAuthenticated(false);
        }
    }, []);

    const value = useMemo(
        () => ({isAuthenticated, isLoading, login, logout}),
        [isAuthenticated, isLoading, login, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
