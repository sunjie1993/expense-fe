"use client";

import {useEffect} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Loader2} from "lucide-react";

export default function Home() {
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                globalThis.location.replace("/dashboard/");
            } else {
                globalThis.location.replace("/login/");
            }
        }
    }, [isAuthenticated, isLoading]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
        </div>
    );
}
