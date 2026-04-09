"use client";

import {useCallback, useRef, useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {AlertCircle, Eye, EyeOff, Loader2} from "lucide-react";
import {cn} from "@/lib/utils";

function SquidShape({type, delay}: { readonly type: "circle" | "triangle" | "square"; readonly delay: string }) {
    const sharedClass = "animate-squid-shape-in";
    const sharedStyle = {animationDelay: delay};

    if (type === "circle") {
        return (
            <div
                className={cn(sharedClass, "h-14 w-14 md:h-20 md:w-20 rounded-full border-2 border-primary")}
                style={sharedStyle}
            />
        );
    }

    if (type === "triangle") {
        return (
            <svg
                viewBox="0 0 80 70"
                className={cn(sharedClass, "w-14 h-12 md:w-20 md:h-17.5 text-primary shrink-0")}
                style={sharedStyle}
            >
                <polygon points="40,4 76,66 4,66" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
        );
    }

    return (
        <div
            className={cn(sharedClass, "h-14 w-14 md:h-20 md:w-20 border-2 border-primary")}
            style={sharedStyle}
        />
    );
}

function SquidTransitionOverlay() {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 md:gap-10 bg-background animate-squid-overlay-in">
            <div className="flex items-center justify-center gap-6 md:gap-10 animate-squid-glow">
                <SquidShape type="circle" delay="0.3s"/>
                <SquidShape type="triangle" delay="0.6s"/>
                <SquidShape type="square" delay="0.9s"/>
            </div>
            <div className="flex flex-col items-center gap-1">
                <p
                    className="animate-squid-shape-in text-muted-foreground text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase font-(family-name:--font-heading)"
                    style={{animationDelay: "1.2s"}}
                >
                    Entering
                </p>
                <p
                    className="animate-squid-shape-in text-primary/60 text-[10px] tracking-[0.2em] uppercase"
                    style={{animationDelay: "1.4s"}}
                >
                    Welcome back, Player
                </p>
            </div>
        </div>
    );
}

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
            {isTransitioning && <SquidTransitionOverlay/>}

            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">

                <div className="absolute inset-0 pointer-events-none select-none text-primary" aria-hidden="true">
                    <svg className="absolute -top-32 -left-32 opacity-[0.045] animate-squid-shape-pulse"
                         style={{animationDelay: "0s", animationDuration: "5s"}}
                         width="420" height="420" viewBox="0 0 420 420">
                        <circle cx="210" cy="210" r="200" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="210" cy="210" r="155" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <svg className="absolute -bottom-24 -right-24 opacity-[0.045] animate-squid-shape-pulse"
                         style={{animationDelay: "1.5s", animationDuration: "6s"}}
                         width="380" height="340" viewBox="0 0 380 340">
                        <polygon points="190,8 372,332 8,332" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <polygon points="190,48 334,308 46,308" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <svg className="absolute top-1/4 -right-20 opacity-[0.035] animate-squid-shape-pulse"
                         style={{animationDelay: "0.8s", animationDuration: "7s"}}
                         width="260" height="260" viewBox="0 0 260 260">
                        <rect x="8" y="8" width="244" height="244" fill="none" stroke="currentColor" strokeWidth="2"/>
                        <rect x="36" y="36" width="188" height="188" fill="none" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                    <svg className="absolute bottom-1/4 -left-14 opacity-[0.03] animate-squid-shape-pulse"
                         style={{animationDelay: "2.2s", animationDuration: "5.5s"}}
                         width="190" height="190" viewBox="0 0 190 190">
                        <rect x="8" y="8" width="174" height="174" fill="none" stroke="currentColor" strokeWidth="1.5"/>
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
                        <div className="flex items-center justify-center gap-3 text-primary">
                            <div className="h-6 w-6 rounded-full border border-primary/70"/>
                            <svg width="22" height="20" viewBox="0 0 22 20" className="shrink-0">
                                <polygon points="11,1 21,19 1,19" fill="none" stroke="currentColor" strokeOpacity="0.7"
                                         strokeWidth="1.5"/>
                            </svg>
                            <div className="h-6 w-6 border border-primary/70"/>
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
