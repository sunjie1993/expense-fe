import {
    Briefcase,
    Car,
    Coffee,
    CreditCard,
    Dumbbell,
    Film,
    Gamepad2,
    Gift,
    GraduationCap,
    Heart,
    Home,
    LucideIcon,
    Plane,
    Shirt,
    ShoppingCart,
    Smartphone,
    Utensils,
} from "lucide-react";

// Map of icon names to lucide-react components
const iconMap: Record<string, LucideIcon> = {
    "credit-card": CreditCard,
    home: Home,
    utensils: Utensils,
    plane: Plane,
    "shopping-cart": ShoppingCart,
    car: Car,
    heart: Heart,
    briefcase: Briefcase,
    gamepad: Gamepad2,
    "graduation-cap": GraduationCap,
    shirt: Shirt,
    smartphone: Smartphone,
    coffee: Coffee,
    film: Film,
    gift: Gift,
    dumbbell: Dumbbell,
};

interface CategoryIconProps {
    iconName: string;
    className?: string;
    color?: string;
}

export function CategoryIcon({iconName, className = "h-5 w-5", color}: Readonly<CategoryIconProps>) {
    const IconComponent = iconMap[iconName] || CreditCard;

    return (
        <IconComponent
            className={className}
            style={color ? {color} : undefined}
        />
    );
}

export function getCategoryIcon(iconName: string): LucideIcon {
    return iconMap[iconName] || CreditCard;
}