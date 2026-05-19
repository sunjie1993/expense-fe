"use client";

import {
    Activity,
    Apple,
    Baby,
    Banana,
    Banknote,
    Bath,
    Beef,
    Beer,
    Bike,
    Bird,
    Boxes,
    Briefcase,
    Building2,
    Bus,
    Calculator,
    Camera,
    Car,
    Carrot,
    Cat,
    Coffee,
    Compass,
    CreditCard,
    Dog,
    DollarSign,
    Droplets,
    Dumbbell,
    Eye,
    FileBadge,
    FileText,
    Film,
    Fish,
    Flame,
    Footprints,
    Fuel,
    Gamepad2,
    Gem,
    Gift,
    GlassWater,
    Glasses,
    Globe,
    GraduationCap,
    Hammer,
    Headphones,
    Heart,
    HeartPulse,
    Home,
    Hotel,
    IceCreamCone,
    Key,
    Lamp,
    Landmark,
    Laptop,
    type LucideIcon,
    Luggage,
    MapPin,
    Mic,
    Microwave,
    Milk,
    Monitor,
    Mountain,
    Music,
    Palette,
    PawPrint,
    Phone,
    PiggyBank,
    Pill,
    Pizza,
    Plane,
    Printer,
    Receipt,
    Repeat,
    Sandwich,
    School,
    Scissors,
    Shield,
    ShieldCheck,
    Ship,
    Shirt,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Sofa,
    Sparkles,
    SquareParking,
    Stethoscope,
    Store,
    Sun,
    Syringe,
    Tag,
    Thermometer,
    Ticket,
    TrainFront,
    Truck,
    Tv,
    Utensils,
    UtensilsCrossed,
    Wallet,
    Watch,
    Wifi,
    Wine,
    Wrench,
    Zap,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
    // Food & drink
    utensils: Utensils,
    "utensils-crossed": UtensilsCrossed,
    pizza: Pizza,
    sandwich: Sandwich,
    beef: Beef,
    fish: Fish,
    apple: Apple,
    banana: Banana,
    carrot: Carrot,
    coffee: Coffee,
    milk: Milk,
    beer: Beer,
    wine: Wine,
    "ice-cream-cone": IceCreamCone,
    "glass-water": GlassWater,

    // Transport
    car: Car,
    plane: Plane,
    bus: Bus,
    "train-front": TrainFront,
    bike: Bike,
    truck: Truck,
    ship: Ship,
    fuel: Fuel,
    "square-parking": SquareParking,

    // Housing & utilities
    home: Home,
    sofa: Sofa,
    lamp: Lamp,
    wrench: Wrench,
    hammer: Hammer,
    key: Key,
    building: Building2,
    microwave: Microwave,
    zap: Zap,
    droplets: Droplets,
    flame: Flame,
    wifi: Wifi,

    // Health & medical
    heart: Heart,
    "heart-pulse": HeartPulse,
    activity: Activity,
    stethoscope: Stethoscope,
    pill: Pill,
    thermometer: Thermometer,
    syringe: Syringe,
    eye: Eye,

    // Shopping & personal
    "shopping-cart": ShoppingCart,
    "shopping-bag": ShoppingBag,
    shirt: Shirt,
    tag: Tag,
    gem: Gem,
    watch: Watch,
    glasses: Glasses,
    footprints: Footprints,
    scissors: Scissors,
    sparkles: Sparkles,
    bath: Bath,

    // Entertainment & leisure
    film: Film,
    gamepad: Gamepad2,
    ticket: Ticket,
    music: Music,
    tv: Tv,
    headphones: Headphones,
    camera: Camera,
    palette: Palette,
    mic: Mic,
    dumbbell: Dumbbell,

    // Finances & admin
    "credit-card": CreditCard,
    wallet: Wallet,
    banknote: Banknote,
    "dollar-sign": DollarSign,
    receipt: Receipt,
    calculator: Calculator,
    landmark: Landmark,
    "piggy-bank": PiggyBank,
    repeat: Repeat,
    "shield-check": ShieldCheck,
    shield: Shield,
    "file-text": FileText,
    "file-badge": FileBadge,

    // Travel
    hotel: Hotel,
    "map-pin": MapPin,
    compass: Compass,
    luggage: Luggage,
    globe: Globe,
    sun: Sun,
    mountain: Mountain,

    // Work & education
    briefcase: Briefcase,
    "graduation-cap": GraduationCap,
    monitor: Monitor,
    laptop: Laptop,
    printer: Printer,
    school: School,

    // Family & kids
    gift: Gift,
    baby: Baby,

    // Pets
    "paw-print": PawPrint,
    dog: Dog,
    cat: Cat,
    bird: Bird,

    // General
    store: Store,
    smartphone: Smartphone,
    phone: Phone,
    boxes: Boxes,
};

interface CategoryIconProps {
    iconName: string;
    className?: string;
    color?: string;
}

export function CategoryIcon({iconName, className = "h-5 w-5", color}: Readonly<CategoryIconProps>) {
    const IconComponent = iconMap[iconName] ?? CreditCard;
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
