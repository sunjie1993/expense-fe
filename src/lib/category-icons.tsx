import {
  CreditCard,
  Home,
  Utensils,
  Plane,
  ShoppingCart,
  Car,
  Heart,
  Briefcase,
  Gamepad2,
  GraduationCap,
  Shirt,
  Smartphone,
  Coffee,
  Film,
  Gift,
  Dumbbell,
  LucideIcon,
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

export function CategoryIcon({ iconName, className = "h-5 w-5", color }: CategoryIconProps) {
  const IconComponent = iconMap[iconName] || CreditCard;

  return (
    <IconComponent
      className={className}
      style={color ? { color } : undefined}
    />
  );
}

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || CreditCard;
}