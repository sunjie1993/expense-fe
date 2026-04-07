import type {Metadata} from "next";
import {Bebas_Neue, Montserrat} from "next/font/google";
import {Providers} from "@/components/providers";
import "./globals.css";

const bebasNeue = Bebas_Neue({
    variable: "--font-heading",
    weight: "400",
    subsets: ["latin"],
});

const montserrat = Montserrat({
    variable: "--font-montserrat",
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
        <body
            className={`${bebasNeue.variable} ${montserrat.variable} font-[family-name:var(--font-montserrat)] antialiased`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}
