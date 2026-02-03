"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import axios from "axios";
import {useAuth} from "@/contexts/auth-context";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Loader2} from "lucide-react";

const loginSchema = z.object({
    passcode: z.string().min(1, "Passcode is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const {login} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [retryAfter, setRetryAfter] = useState<number>(0);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            passcode: "",
        },
    });

    useEffect(() => {
        if (retryAfter <= 0) return;

        const timer = globalThis.setInterval(() => {
            setRetryAfter((prev) => {
                const next = prev - 1;
                if (next <= 0) {
                    setError(null);
                    return 0;
                }
                return next;
            });
        }, 1000);

        return () => globalThis.clearInterval(timer);
    }, [retryAfter]);

    async function onSubmit(data: LoginFormValues) {
        setError(null);
        setIsLoading(true);

        try {
            await login(data.passcode);
            router.push("/dashboard");
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 429) {
                const retrySeconds = err.response.data.retry_after_seconds || 900;
                setRetryAfter(retrySeconds);
                const minutes = Math.ceil(retrySeconds / 60);
                const pluralSuffix = minutes === 1 ? "" : "s";
                setError(`Too many login attempts. Please try again in ${minutes} minute${pluralSuffix}.`);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Invalid passcode. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    function getButtonContent() {
        if (isLoading) {
            return (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Signing in...
                </>
            );
        }

        if (retryAfter > 0) {
            return "Please wait...";
        }

        return "Sign In";
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
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="passcode"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Passcode</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your passcode"
                                                {...field}
                                                disabled={isLoading || retryAfter > 0}
                                            />
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                            {error && (
                                <div className="text-sm text-destructive text-center">
                                    <p>{error}</p>
                                    {retryAfter > 0 && (
                                        <p className="mt-1 font-mono">
                                            {Math.floor(retryAfter / 60)}:{(retryAfter % 60).toString().padStart(2, "0")}
                                        </p>
                                    )}
                                </div>
                            )}
                            <Button type="submit" className="w-full" disabled={isLoading || retryAfter > 0}>
                                {getButtonContent()}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
