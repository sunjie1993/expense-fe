"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {API_BASE_URL} from "@/lib/api";

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

    console.log("[AuthProvider] Rendering - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

    useEffect(() => {
        const pathname = typeof window !== 'undefined' ? window.location.pathname : 'SSR';
        console.log("[Auth] useEffect running, pathname:", pathname);
        console.log("[Auth] Current state - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);

        // Skip auth check if on login page
        if (pathname.includes('/login')) {
            console.log("[Auth] On login page, skipping auth check");
            setIsLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                console.log("[Auth] Checking authentication via refresh endpoint...");
                console.log("[Auth] API_BASE_URL:", API_BASE_URL);

                // Use refresh endpoint directly - if we have valid refresh token, we're authenticated
                const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include',
                });

                console.log("[Auth] Refresh response status:", refreshResponse.status);

                if (refreshResponse.ok) {
                    console.log("[Auth] Refresh successful - user is authenticated");
                    setIsAuthenticated(true);
                } else {
                    console.log("[Auth] Refresh failed - user is not authenticated");
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("[Auth] Check failed with error:", err);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        void checkAuth();
    }, []);

    const login = useCallback(async (passcode: string) => {
        console.log("[Auth] Logging in...");
        console.log("[Auth] API_BASE_URL:", API_BASE_URL);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({passcode}),
        });

        console.log("[Auth] Login response status:", response.status);

        const data = await response.json();
        console.log("[Auth] Login response data:", data);

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Login failed");
        }

        console.log("[Auth] Login successful, setting isAuthenticated=true");
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
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
