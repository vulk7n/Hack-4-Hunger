
'use client';

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type StarRatingProps = {
    rating: number;
    totalStars?: number;
    className?: string;
};

export function StarRating({ rating, totalStars = 5, className }: StarRatingProps) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className={cn("flex items-center gap-1 text-yellow-400", className)}>
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="w-5 h-5" fill="currentColor" />
            ))}
            {hasHalfStar && (
                <div className="relative">
                    <Star key="half" className="w-5 h-5" fill="currentColor"/>
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-card/80 backdrop-blur-sm" />
                </div>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="w-5 h-5 text-gray-400" fill="currentColor" />
            ))}
        </div>
    );
}
