"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {api} from "@/lib/api";
import type {ApiResponse, LoginResponse} from "@/types/api";
import {migrateLegacyToken, removeSecureToken} from "@/lib/secure-storage";

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
                await api.get("/api/categories/main");
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        void checkAuth();
    }, []);

    const login = useCallback(async (passcode: string) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/api/auth/login",
            {passcode}
        );

        if (!response.data.success) {
            setIsAuthenticated(false);
            throw new Error("Login failed");
        }

        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            removeSecureToken();
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
