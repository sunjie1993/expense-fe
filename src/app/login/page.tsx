"use client";

import {useCallback, useRef, useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertCircle, Eye, EyeOff, Loader2} from "lucide-react";
import {cn} from "@/lib/utils";
import {AvengersTransitionOverlay} from "@/components/avengers-transition-overlay";


export default function LoginPage() {
    const {login} = useAuth();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const triggerShake = () => {
        cardRef.current?.classList.remove("animate-shake");
        setTimeout(() => cardRef.current?.classList.add("animate-shake"), 0);
    };

    const handleLogin = useCallback(async () => {
        const trimmedPasscode = passcode.trim();
        if (!trimmedPasscode) {
            setError("Passcode is required");
            triggerShake();
            inputRef.current?.focus();
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await login(trimmedPasscode);
            setIsTransitioning(true);
            setTimeout(() => { globalThis.location.href = "/dashboard/"; }, 1800);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
            setIsLoading(false);
            triggerShake();
            inputRef.current?.focus();
        }
    }, [passcode, login]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <>
            {isTransitioning && <AvengersTransitionOverlay/>}

            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

                {/* Decorative Avengers background shapes */}
                <div className="absolute inset-0 pointer-events-none select-none text-primary" aria-hidden="true">
                    {/* Large A — top-left */}
                    <svg className="absolute -top-20 -left-20 opacity-[0.04] animate-float-pulse"
                         style={{animationDelay: "0s", animationDuration: "5s"}}
                         width="400" height="400" viewBox="0 0 80 80">
                        <line x1="40" y1="6" x2="8" y2="74" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                        <line x1="40" y1="6" x2="72" y2="74" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                        <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    {/* Shield rings — bottom-right */}
                    <svg className="absolute -bottom-20 -right-20 opacity-[0.04] animate-float-pulse"
                         style={{animationDelay: "1.5s", animationDuration: "6s"}}
                         width="380" height="380" viewBox="0 0 380 380">
                        <circle cx="190" cy="190" r="180" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="190" cy="190" r="135" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                        <circle cx="190" cy="190" r="90" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    {/* Star — top-right */}
                    <svg className="absolute top-1/4 -right-16 opacity-[0.035] animate-float-pulse"
                         style={{animationDelay: "0.8s", animationDuration: "7s"}}
                         width="240" height="240" viewBox="0 0 100 100">
                        <polygon
                            points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
                            fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"
                        />
                    </svg>
                    {/* Small A — bottom-left */}
                    <svg className="absolute bottom-1/4 -left-10 opacity-[0.03] animate-float-pulse"
                         style={{animationDelay: "2.2s", animationDuration: "5.5s"}}
                         width="180" height="180" viewBox="0 0 80 80">
                        <line x1="40" y1="6" x2="8" y2="74" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                        <line x1="40" y1="6" x2="72" y2="74" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                        <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                </div>

                <Card
                    ref={cardRef}
                    className={cn("w-full max-w-md animate-fade-in-up glass-card elevation-4")}
                    onAnimationEnd={(e) => {
                        if (e.animationName === "shake") {
                            cardRef.current?.classList.remove("animate-shake");
                        }
                    }}
                >
                    <CardHeader className="space-y-3 items-center text-center">
                        <div className="flex items-center justify-center text-primary">
                            <svg viewBox="0 0 80 80" className="h-10 w-10 animate-hero-glow" aria-hidden="true">
                                <line x1="40" y1="6" x2="8" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                                <line x1="40" y1="6" x2="72" y2="74" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
                                <line x1="20" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                                <line x1="40" y1="6" x2="40" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-2xl gradient-text">
                                Expense Tracker
                            </CardTitle>
                            <CardDescription>
                                Identify yourself to enter
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className={cn("transition-opacity duration-200", isLoading && "opacity-60 pointer-events-none")}>
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        aria-invalid={Boolean(error)}
                                        aria-describedby={error === null ? undefined : "login-error"}
                                        className={cn("pr-10", error && "border-destructive focus-visible:ring-destructive/50")}
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
                                className="w-full active:scale-[0.98] transition-all gradient-shine"
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
                            {!isLoading && (
                                <p className="text-center text-xs text-muted-foreground">
                                    Press ↵ to sign in
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
