"use client";

import {memo} from "react";
import {Button} from "@/components/ui/button";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface PaginationControlsProps {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly pageSize: number;
    readonly offset: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
    readonly isLoading: boolean;
    readonly onPageChange: (page: number) => void;
}

export const PaginationControls = memo(function PaginationControls({
                                                                       currentPage,
                                                                       totalPages,
                                                                       totalItems,
                                                                       pageSize,
                                                                       offset,
                                                                       hasNextPage,
                                                                       hasPrevPage,
                                                                       isLoading,
                                                                       onPageChange,
                                                                   }: PaginationControlsProps) {
    const startItem = offset + 1;
    const endItem = Math.min(offset + pageSize, totalItems);

    const handlePrevious = () => {
        if (hasPrevPage && !isLoading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage && !isLoading) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <nav
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t"
            aria-label="Pagination"
        >
            <div className="text-sm text-muted-foreground tabular-nums">
                Showing <span className="font-medium">{startItem}</span> to{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalItems}</span> expenses
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={!hasPrevPage || isLoading}
                    aria-label="Go to previous page"
                    className="transition-all"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true"/>
                    Previous
                </Button>
                <output className="text-sm font-medium px-3 min-w-24 text-center tabular-nums" aria-live="polite">
                    Page {currentPage} of {totalPages}
                </output>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={!hasNextPage || isLoading}
                    aria-label="Go to next page"
                    className="transition-all"
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true"/>
                </Button>
            </div>
        </nav>
    );
});