"use client";

import { memo } from "react";
import { CategoryIcon } from "@/lib/category-icons";

interface CategoryCellProps {
  readonly category: string;
  readonly parentCategory: string;
  readonly icon?: string;
  readonly color?: string;
}

/**
 * CategoryCell displays expense category information with an icon
 */
export const CategoryCell = memo(function CategoryCell({
  category,
  parentCategory,
  icon,
  color,
}: CategoryCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="p-2 rounded-lg transition-transform hover:scale-110"
        style={color ? { backgroundColor: `${color}20` } : undefined}
        aria-hidden="true"
      >
        <CategoryIcon
          iconName={icon || "credit-card"}
          className="h-4 w-4"
          color={color}
        />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{category}</p>
        <p className="text-xs text-muted-foreground truncate">{parentCategory}</p>
      </div>
    </div>
  );
});