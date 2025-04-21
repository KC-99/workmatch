import React from "react";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
}

export function RatingDisplay({ rating, reviewCount }: RatingDisplayProps) {
  return (
    <div className="flex items-center">
      <Star className="w-4 h-4 fill-current text-yellow-400" />
      <span className="ml-1 text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
      <span className="ml-1 text-sm text-gray-500">({reviewCount} reviews)</span>
    </div>
  );
}
