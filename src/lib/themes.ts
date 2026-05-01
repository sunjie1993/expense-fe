export type HeroId =
    | "iron-man"
    | "captain-america"
    | "thor"
    | "hulk"
    | "black-panther"
    | "scarlet-witch";

export interface HeroTheme {
    id: HeroId;
    name: string;
    tagline: string;
    previewPrimary: string;
    previewAccent: string;
}

export const HERO_THEMES: HeroTheme[] = [
    {
        id: "iron-man",
        name: "Iron Man",
        tagline: "I am Iron Man",
        previewPrimary: "#c0392b",
        previewAccent: "#e8a020",
    },
    {
        id: "captain-america",
        name: "Captain America",
        tagline: "I can do this all day",
        previewPrimary: "#1a4a8a",
        previewAccent: "#c8d0dc",
    },
    {
        id: "thor",
        name: "Thor",
        tagline: "Strongest Avenger",
        previewPrimary: "#1e2a7a",
        previewAccent: "#f5c518",
    },
    {
        id: "hulk",
        name: "Hulk",
        tagline: "Hulk smash",
        previewPrimary: "#1e6b1e",
        previewAccent: "#6a0dad",
    },
    {
        id: "black-panther",
        name: "Black Panther",
        tagline: "Wakanda Forever",
        previewPrimary: "#3b1a6e",
        previewAccent: "#9ab0c8",
    },
    {
        id: "scarlet-witch",
        name: "Scarlet Witch",
        tagline: "I am the Scarlet Witch",
        previewPrimary: "#a50000",
        previewAccent: "#d44aaa",
    },
];

export const DEFAULT_HERO_ID: HeroId = "iron-man";

export const HERO_CSS_VARS: Record<HeroId, Record<string, string>> = {
    "iron-man": {
        "--primary": "oklch(0.48 0.22 25)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.72 0.17 72)",
        "--accent-foreground": "oklch(0.98 0 0)",
        "--ring": "oklch(0.48 0.22 25 / 60%)",
        "--glow": "oklch(0.48 0.22 25)",
        "--chart-1": "oklch(0.48 0.22 25)",
        "--chart-2": "oklch(0.72 0.17 72)",
        "--chart-3": "oklch(0.62 0.18 38)",
        "--chart-4": "oklch(0.38 0.14 20)",
        "--chart-5": "oklch(0.78 0.12 68)",
        "--sidebar-primary": "oklch(0.48 0.22 25)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.48 0.22 25 / 60%)",
        "--shadow-color": "oklch(0.48 0.22 25 / 20%)",
    },
    "captain-america": {
        "--primary": "oklch(0.40 0.15 258)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.82 0.02 258)",
        "--accent-foreground": "oklch(0.12 0 0)",
        "--ring": "oklch(0.40 0.15 258 / 60%)",
        "--glow": "oklch(0.40 0.15 258)",
        "--chart-1": "oklch(0.40 0.15 258)",
        "--chart-2": "oklch(0.82 0.02 258)",
        "--chart-3": "oklch(0.52 0.20 25)",
        "--chart-4": "oklch(0.60 0.08 240)",
        "--chart-5": "oklch(0.75 0.01 240)",
        "--sidebar-primary": "oklch(0.40 0.15 258)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.40 0.15 258 / 60%)",
        "--shadow-color": "oklch(0.40 0.15 258 / 20%)",
    },
    "thor": {
        "--primary": "oklch(0.38 0.17 268)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.82 0.17 88)",
        "--accent-foreground": "oklch(0.12 0 0)",
        "--ring": "oklch(0.38 0.17 268 / 60%)",
        "--glow": "oklch(0.38 0.17 268)",
        "--chart-1": "oklch(0.38 0.17 268)",
        "--chart-2": "oklch(0.82 0.17 88)",
        "--chart-3": "oklch(0.78 0.02 240)",
        "--chart-4": "oklch(0.28 0.10 268)",
        "--chart-5": "oklch(0.65 0.12 88)",
        "--sidebar-primary": "oklch(0.38 0.17 268)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.38 0.17 268 / 60%)",
        "--shadow-color": "oklch(0.38 0.17 268 / 20%)",
    },
    "hulk": {
        "--primary": "oklch(0.52 0.18 142)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.45 0.19 305)",
        "--accent-foreground": "oklch(0.98 0 0)",
        "--ring": "oklch(0.52 0.18 142 / 60%)",
        "--glow": "oklch(0.52 0.18 142)",
        "--chart-1": "oklch(0.52 0.18 142)",
        "--chart-2": "oklch(0.45 0.19 305)",
        "--chart-3": "oklch(0.68 0.20 142)",
        "--chart-4": "oklch(0.34 0.12 142)",
        "--chart-5": "oklch(0.58 0.14 305)",
        "--sidebar-primary": "oklch(0.52 0.18 142)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.52 0.18 142 / 60%)",
        "--shadow-color": "oklch(0.52 0.18 142 / 20%)",
    },
    "black-panther": {
        "--primary": "oklch(0.42 0.14 295)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.70 0.03 255)",
        "--accent-foreground": "oklch(0.12 0 0)",
        "--ring": "oklch(0.42 0.14 295 / 60%)",
        "--glow": "oklch(0.42 0.14 295)",
        "--chart-1": "oklch(0.42 0.14 295)",
        "--chart-2": "oklch(0.70 0.03 255)",
        "--chart-3": "oklch(0.55 0.18 295)",
        "--chart-4": "oklch(0.28 0.08 295)",
        "--chart-5": "oklch(0.62 0.06 255)",
        "--sidebar-primary": "oklch(0.42 0.14 295)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.42 0.14 295 / 60%)",
        "--shadow-color": "oklch(0.42 0.14 295 / 20%)",
    },
    "scarlet-witch": {
        "--primary": "oklch(0.48 0.24 15)",
        "--primary-foreground": "oklch(0.98 0 0)",
        "--accent": "oklch(0.60 0.22 355)",
        "--accent-foreground": "oklch(0.98 0 0)",
        "--ring": "oklch(0.48 0.24 15 / 60%)",
        "--glow": "oklch(0.48 0.24 15)",
        "--chart-1": "oklch(0.48 0.24 15)",
        "--chart-2": "oklch(0.60 0.22 355)",
        "--chart-3": "oklch(0.62 0.20 340)",
        "--chart-4": "oklch(0.34 0.16 15)",
        "--chart-5": "oklch(0.72 0.16 350)",
        "--sidebar-primary": "oklch(0.48 0.24 15)",
        "--sidebar-primary-foreground": "oklch(0.98 0 0)",
        "--sidebar-ring": "oklch(0.48 0.24 15 / 60%)",
        "--shadow-color": "oklch(0.48 0.24 15 / 20%)",
    },
};
