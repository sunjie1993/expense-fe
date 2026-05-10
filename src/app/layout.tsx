import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {Providers} from "@/components/providers";
import "./globals.css";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Expense Tracker",
    description: "Track and manage your expenses",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable} font-[family-name:var(--font-sans)] antialiased`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
