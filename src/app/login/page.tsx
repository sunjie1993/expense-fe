"use client";

import {useCallback, useRef, useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Eye, EyeOff, Loader2} from "lucide-react";

export default function LoginPage() {
    const {login} = useAuth();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [shakeKey, setShakeKey] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleLogin = useCallback(async () => {
        if (!passcode) {
            setError("Passcode is required");
            setShakeKey(k => k + 1);
            inputRef.current?.focus();
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await login(passcode);
            globalThis.location.href = "/dashboard/";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            setShakeKey(k => k + 1);
            inputRef.current?.focus();
        } finally {
            setIsLoading(false);
        }
    }, [passcode, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background">
            <Card key={shakeKey} className={`w-full max-w-md animate-fade-in-up ${shakeKey > 0 ? "animate-shake" : ""}`}>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Expense Tracker
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your passcode to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
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
                                    aria-invalid={!!error}
                                    aria-describedby={error ? "login-error" : undefined}
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
                            <div id="login-error" className="text-sm text-destructive text-center animate-fade-in-down">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full active:scale-[0.98] transition-all"
                            disabled={isLoading || !passcode}
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