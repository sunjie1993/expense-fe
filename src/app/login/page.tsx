"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertCircle, Eye, EyeOff, Loader2, Wallet} from "lucide-react";
import {cn} from "@/lib/utils";

const TIME_GREETINGS = {
    morning:   {en: "Good Morning",   ko: "좋은 아침이에요"},
    afternoon: {en: "Good Afternoon", ko: "좋은 오후예요"},
    evening:   {en: "Good Evening",   ko: "좋은 저녁이에요"},
    night:     {en: "Good Night",     ko: "안녕히 주무세요"},
} as const;

function getGreetingKey(): keyof typeof TIME_GREETINGS {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "morning";
    if (h >= 12 && h < 17) return "afternoon";
    if (h >= 17 && h < 21) return "evening";
    return "night";
}

function useRotatingGreeting(intervalMs = 2500) {
    const pair = TIME_GREETINGS[getGreetingKey()];
    const [isKorean, setIsKorean] = useState(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const id = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIsKorean(v => !v);
                setVisible(true);
            }, 300);
        }, intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return {text: isKorean ? pair.ko : pair.en, visible};
}

export default function LoginPage() {
    const {login} = useAuth();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [transitioning, setTransitioning] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const greeting = useRotatingGreeting();

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
            setTransitioning(true);
            setTimeout(() => { globalThis.location.href = "/dashboard/"; }, 450);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            {transitioning && (
                <div className="fixed inset-0 z-50 bg-background animate-fade-in pointer-events-none" />
            )}
            <Card
                ref={cardRef}
                className={cn(
                    "w-full max-w-md shadow-lg animate-fade-in-up transition-all duration-300",
                    transitioning && "opacity-0 scale-95 pointer-events-none"
                )}
                onAnimationEnd={(e) => {
                    if (e.animationName === "shake") {
                        cardRef.current?.classList.remove("animate-shake");
                    }
                }}
            >
                <CardHeader className="space-y-3 items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                        <Wallet className="h-6 w-6 text-primary-foreground"/>
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-2xl">Expense Tracker</CardTitle>
                        <CardDescription
                            className={cn(
                                "transition-all duration-300",
                                greeting.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
                            )}
                        >
                            {greeting.text}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent
                    className={cn("transition-opacity duration-200", isLoading && "opacity-60 pointer-events-none")}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="passcode" className="text-sm font-medium">
                                Passcode
                            </label>
                            <div
                                className={cn(
                                    "relative flex items-center h-10 w-full rounded-md border bg-background px-3",
                                    "focus-within:outline-none focus-within:ring-1 focus-within:ring-ring",
                                    error && "border-destructive focus-within:ring-destructive/50",
                                    "cursor-text"
                                )}
                                onClick={() => inputRef.current?.focus()}
                            >
                                {/* Invisible but focusable real input */}
                                <input
                                    ref={inputRef}
                                    id="passcode"
                                    type="text"
                                    value={passcode}
                                    onChange={(e) => {
                                        setPasscode(e.target.value);
                                        if (error) setError(null);
                                    }}
                                    disabled={isLoading}
                                    autoFocus
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={error === null ? undefined : "login-error"}
                                    className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
                                />

                                {/* Visual display */}
                                <div className="flex-1 flex items-center overflow-hidden min-w-0">
                                    {showPassword ? (
                                        passcode ? (
                                            <span className="text-sm font-mono tracking-widest">{passcode}</span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">Enter your passcode</span>
                                        )
                                    ) : passcode.length === 0 ? (
                                        <span className="text-sm text-muted-foreground">Enter your passcode</span>
                                    ) : (
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {Array.from({length: passcode.length}).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-2.5 h-2.5 rounded-full bg-foreground shrink-0 animate-dot-pop"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPassword(v => !v);
                                    }}
                                    className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
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
                        {!isLoading && (
                            <p className="text-center text-xs text-muted-foreground">
                                Press ↵ to sign in
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
