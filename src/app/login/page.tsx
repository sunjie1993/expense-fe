"use client";

import {useCallback, useRef, useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertCircle, Eye, EyeOff, Loader2, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";

export default function LoginPage() {
    const {login} = useAuth();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const triggerShake = () => {
        cardRef.current?.classList.remove("animate-shake");
        void cardRef.current?.offsetWidth; // force reflow to restart animation
        cardRef.current?.classList.add("animate-shake");
    };

    const handleLogin = useCallback(async () => {
        const trimmedPasscode = passcode.trim();
        if (trimmedPasscode.length === 0) {
            setError("Passcode is required");
            triggerShake();
            inputRef.current?.focus();
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await login(trimmedPasscode);
            globalThis.location.href = "/dashboard/";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            triggerShake();
            inputRef.current?.focus();
        } finally {
            setIsLoading(false);
        }
    }, [passcode, login]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    }, [handleLogin]);

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{background: "radial-gradient(ellipse at center, oklch(0.932 0.032 254.585 / 0.5) 0%, oklch(0.968 0.007 247.896) 70%)"}}
        >
            <Card
                ref={cardRef}
                className={cn("w-full max-w-md animate-fade-in-up elevation-2")}
                onAnimationEnd={(e) => {
                    if (e.animationName === "shake") {
                        cardRef.current?.classList.remove("animate-shake");
                    }
                }}
            >
                <CardHeader className="space-y-3 items-center text-center">
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center">
                        <Wallet className="h-7 w-7 text-primary"/>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Expense Tracker
                        </CardTitle>
                        <CardDescription>
                            Enter your passcode to access your dashboard
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <label htmlFor="passcode" className="text-sm font-medium">
                                Passcode
                            </label>
                            <div className="relative">
                                <Input
                                    ref={inputRef}
                                    id="passcode"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your passcode"
                                    value={passcode}
                                    onChange={(e) => {
                                        setPasscode(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                    aria-invalid={error !== null}
                                    aria-describedby={error !== null ? "login-error" : undefined}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                </button>
                            </div>
                        </div>
                        {error && (
                            <div
                                id="login-error"
                                className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 animate-fade-in-down"
                                role="alert"
                            >
                                <AlertCircle className="h-4 w-4 text-destructive shrink-0"/>
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full active:scale-[0.98] transition-all"
                            disabled={isLoading || passcode.trim().length === 0}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}