"use client";

import {useState} from "react";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader2} from "lucide-react";

export default function LoginPage() {
    const {login} = useAuth();
    const [passcode, setPasscode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin() {
        if (!passcode) {
            setError("Passcode is required");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await login(passcode);
            window.location.href = "/dashboard/";
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Expense Tracker
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your passcode to access your dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="passcode" className="text-sm font-medium">
                            Passcode
                        </label>
                        <Input
                            id="passcode"
                            type="password"
                            placeholder="Enter your passcode"
                            value={passcode}
                            onChange={(e) => setPasscode(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleLogin();
                                }
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-destructive text-center">
                            {error}
                        </div>
                    )}
                    <Button
                        type="button"
                        className="w-full"
                        onClick={handleLogin}
                        disabled={isLoading}
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
                </CardContent>
            </Card>
        </div>
    );
}
