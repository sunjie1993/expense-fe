"use client";

import {createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState,} from "react";
import {api} from "@/lib/api";
import type {ApiResponse, LoginResponse} from "@/types/api";
import {
    hasValidToken,
    migrateLegacyToken,
    removeSecureToken,
    setSecureToken,
} from "@/lib/secure-storage";

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
        migrateLegacyToken();

        const hasToken = hasValidToken();
        setIsAuthenticated(hasToken);
        setIsLoading(false);
    }, []);

    const login = useCallback(async (passcode: string) => {
        try {
            const response = await api.post<ApiResponse<LoginResponse>>(
                "/api/auth/login",
                {passcode}
            );

            if (response.data.success) {
                // Store token securely with encryption and validation
                setSecureToken(response.data.data.token);
                setIsAuthenticated(true);
            } else {
                throw new Error("Login failed");
            }
        } catch (error) {
            // Ensure no partial data is stored on error
            removeSecureToken();
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        removeSecureToken();
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
