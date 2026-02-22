import React from 'react';
import { Star } from 'lucide-react';

interface RatingConfigProps {
    maxStars: number;
    onMaxStarsChange: (value: number) => void;
}

export const RatingConfig: React.FC<RatingConfigProps> = ({ maxStars, onMaxStarsChange }) => {
    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-400">Number of Stars</label>
            <select
                value={maxStars}
                onChange={(e) => onMaxStarsChange(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
            >
                {[3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                    <option key={val} value={val} className="bg-zinc-900">
                        {val} stars
                    </option>
                ))}
            </select>
            <div className="flex gap-1 mt-2">
                {Array.from({ length: maxStars }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
            </div>
        </div>
    );
};
