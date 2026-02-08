"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {API_BASE_URL, setAccessToken, setRefreshToken, clearTokens} from "@/lib/api";

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
        if (typeof globalThis.sessionStorage === "undefined") return;

        const pathname = globalThis.location.pathname;
        if (pathname.includes("/login")) {
            setIsLoading(false);
            return;
        }

        const initAuth = async () => {
            const refreshToken = sessionStorage.getItem("refreshToken");
            if (!refreshToken) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${refreshToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setAccessToken(data.data.accessToken);
                    setIsAuthenticated(true);
                } else {
                    clearTokens();
                }
            } catch {
                clearTokens();
            } finally {
                setIsLoading(false);
            }
        };

        void initAuth();
    }, []);

    const login = useCallback(async (passcode: string) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({passcode}),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.error || "Login failed");
        }

        setAccessToken(data.data.accessToken);
        setRefreshToken(data.data.refreshToken);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        clearTokens();
        setIsAuthenticated(false);
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
