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
    type LucideIcon,
    Plane,
    Shirt,
    ShoppingCart,
    Smartphone,
    Utensils,
} from "lucide-react";

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
    return <IconComponent className={className} style={color ? {color} : undefined}/>;
}

interface CategoryIconBadgeProps {
    iconName: string;
    color?: string;
}

export function CategoryIconBadge({iconName, color}: Readonly<CategoryIconBadgeProps>) {
    return (
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={color ? {backgroundColor: `${color}20`} : undefined}
            aria-hidden="true"
        >
            <CategoryIcon iconName={iconName} className="h-4 w-4" color={color}/>
        </div>
    );
}
