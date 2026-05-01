"use client";

import {createContext, useContext, useEffect, useState, type ReactNode} from "react";
import {type HeroId, DEFAULT_HERO_ID, HERO_CSS_VARS} from "@/lib/themes";

const STORAGE_KEY = "expense-hero-theme";

interface HeroThemeContextValue {
    activeHero: HeroId;
    setHero: (id: HeroId) => void;
}

const HeroThemeContext = createContext<HeroThemeContextValue | null>(null);

export function HeroThemeProvider({children}: Readonly<{ children: ReactNode }>) {
    const [activeHero, setActiveHero] = useState<HeroId>(() => {
        if (typeof window === "undefined") return DEFAULT_HERO_ID;
        return (localStorage.getItem(STORAGE_KEY) as HeroId | null) ?? DEFAULT_HERO_ID;
    });

    useEffect(() => {
        const el = document.documentElement;
        el.setAttribute("data-hero", activeHero);
        const vars = HERO_CSS_VARS[activeHero];
        for (const [prop, value] of Object.entries(vars)) {
            el.style.setProperty(prop, value);
        }
        localStorage.setItem(STORAGE_KEY, activeHero);
    }, [activeHero]);

    return (
        <HeroThemeContext.Provider value={{activeHero, setHero: setActiveHero}}>
            {children}
        </HeroThemeContext.Provider>
    );
}

export function useHeroTheme(): HeroThemeContextValue {
    const ctx = useContext(HeroThemeContext);
    if (!ctx) throw new Error("useHeroTheme must be used within HeroThemeProvider");
    return ctx;
}
