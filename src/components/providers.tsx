"use client";

import {SWRConfig} from "swr";
import {AuthProvider} from "@/contexts/auth-context";
import {Toaster} from "@/components/ui/sonner";
import {fetcher} from "@/lib/api";
import type {ReactNode} from "react";

console.log("=== PROVIDERS MODULE LOADED ===");

export function Providers({children}: Readonly<{ children: ReactNode }>) {
    console.log("[Providers] Rendering...");
    return (
        <SWRConfig
            value={{
                fetcher,
                revalidateOnFocus: false,
                shouldRetryOnError: false,
            }}
        >
            <AuthProvider>
                {children}
                <Toaster position="top-center" richColors/>
            </AuthProvider>
        </SWRConfig>
    );
}
