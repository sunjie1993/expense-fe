"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {api} from "@/lib/api";
import type {ApiResponse, LoginResponse} from "@/types/api";

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (passcode: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: Readonly<{ children: ReactNode }>) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        setIsAuthenticated(!!token);
        setIsLoading(false);
    }, []);

    const login = useCallback(async (passcode: string) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/api/auth/login",
            {passcode}
        );

        if (response.data.success) {
            localStorage.setItem("auth_token", response.data.data.token);
            setIsAuthenticated(true);
        } else {
            throw new Error("Login failed");
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("auth_token");
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
