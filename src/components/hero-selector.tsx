"use client";

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {HERO_THEMES, type HeroId, type HeroTheme} from "@/lib/themes";
import {useHeroTheme} from "@/contexts/hero-theme-context";
import {Check} from "lucide-react";

interface HeroCardProps {
    hero: HeroTheme;
    isActive: boolean;
    onSelect: (id: HeroId) => void;
}

function HeroCard({hero, isActive, onSelect}: Readonly<HeroCardProps>) {
    return (
        <button
            type="button"
            onClick={() => onSelect(hero.id)}
            className={cn(
                "relative flex flex-col gap-3 rounded-xl border p-4 text-left transition-all",
                "hover:bg-accent/10 active:scale-95",
                isActive
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/40"
            )}
            aria-pressed={isActive}
        >
            {isActive && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                    <Check className="h-3 w-3 text-primary-foreground"/>
                </span>
            )}

            {/* Color swatch */}
            <div className="flex gap-2">
                <span
                    className="h-6 w-6 rounded-full border border-white/10 shadow-sm"
                    style={{background: hero.previewPrimary}}
                />
                <span
                    className="h-6 w-6 rounded-full border border-white/10 shadow-sm"
                    style={{background: hero.previewAccent}}
                />
            </div>

            <div>
                <p className="text-sm font-semibold leading-none">{hero.name}</p>
                <p className="mt-1 text-xs text-muted-foreground italic">&ldquo;{hero.tagline}&rdquo;</p>
            </div>
        </button>
    );
}

interface HeroSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HeroSelector({open, onOpenChange}: Readonly<HeroSelectorProps>) {
    const {activeHero, setHero} = useHeroTheme();

    const handleSelect = (id: HeroId) => {
        setHero(id);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md" aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Choose Your Hero</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    {HERO_THEMES.map((hero) => (
                        <HeroCard
                            key={hero.id}
                            hero={hero}
                            isActive={activeHero === hero.id}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
