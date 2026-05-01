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
    {id: "iron-man",        name: "Iron Man",         tagline: "I am Iron Man",            previewPrimary: "#c0392b", previewAccent: "#e8a020"},
    {id: "captain-america", name: "Captain America",  tagline: "I can do this all day",    previewPrimary: "#1a4a8a", previewAccent: "#c8d0dc"},
    {id: "thor",            name: "Thor",             tagline: "Strongest Avenger",        previewPrimary: "#1e2a7a", previewAccent: "#f5c518"},
    {id: "hulk",            name: "Hulk",             tagline: "Hulk smash",               previewPrimary: "#1e6b1e", previewAccent: "#6a0dad"},
    {id: "black-panther",   name: "Black Panther",    tagline: "Wakanda Forever",          previewPrimary: "#3b1a6e", previewAccent: "#9ab0c8"},
    {id: "scarlet-witch",   name: "Scarlet Witch",    tagline: "I am the Scarlet Witch",   previewPrimary: "#a50000", previewAccent: "#d44aaa"},
];

export const DEFAULT_HERO_ID: HeroId = "iron-man";

const LIGHT_FG = "oklch(0.98 0 0)";
const DARK_FG = "oklch(0.12 0 0)";

function heroVars(
    primaryLCH: string,
    accent: string,
    accentFg: string,
    chart3: string,
    chart4: string,
    chart5: string,
): Record<string, string> {
    const primary = `oklch(${primaryLCH})`;
    const ring = `oklch(${primaryLCH} / 60%)`;
    return {
        "--primary": primary,
        "--primary-foreground": LIGHT_FG,
        "--accent": accent,
        "--accent-foreground": accentFg,
        "--ring": ring,
        "--glow": primary,
        "--chart-1": primary,
        "--chart-2": accent,
        "--chart-3": chart3,
        "--chart-4": chart4,
        "--chart-5": chart5,
        "--sidebar-primary": primary,
        "--sidebar-primary-foreground": LIGHT_FG,
        "--sidebar-ring": ring,
        "--shadow-color": `oklch(${primaryLCH} / 20%)`,
    };
}

export const HERO_CSS_VARS: Record<HeroId, Record<string, string>> = {
    "iron-man":        heroVars("0.48 0.22 25",  "oklch(0.72 0.17 72)",  LIGHT_FG, "oklch(0.62 0.18 38)",  "oklch(0.38 0.14 20)",  "oklch(0.78 0.12 68)"),
    "captain-america": heroVars("0.40 0.15 258", "oklch(0.82 0.02 258)", DARK_FG,  "oklch(0.52 0.20 25)",  "oklch(0.60 0.08 240)", "oklch(0.75 0.01 240)"),
    "thor":            heroVars("0.38 0.17 268", "oklch(0.82 0.17 88)",  DARK_FG,  "oklch(0.78 0.02 240)", "oklch(0.28 0.10 268)", "oklch(0.65 0.12 88)"),
    "hulk":            heroVars("0.52 0.18 142", "oklch(0.45 0.19 305)", LIGHT_FG, "oklch(0.68 0.20 142)", "oklch(0.34 0.12 142)", "oklch(0.58 0.14 305)"),
    "black-panther":   heroVars("0.42 0.14 295", "oklch(0.70 0.03 255)", DARK_FG,  "oklch(0.55 0.18 295)", "oklch(0.28 0.08 295)", "oklch(0.62 0.06 255)"),
    "scarlet-witch":   heroVars("0.48 0.24 15",  "oklch(0.60 0.22 355)", LIGHT_FG, "oklch(0.62 0.20 340)", "oklch(0.34 0.16 15)",  "oklch(0.72 0.16 350)"),
};
