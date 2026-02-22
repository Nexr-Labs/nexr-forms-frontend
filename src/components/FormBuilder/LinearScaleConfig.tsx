import React from 'react';

interface LinearScaleConfigProps {
    minValue: number;
    maxValue: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
}

export const LinearScaleConfig: React.FC<LinearScaleConfigProps> = ({
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
}) => {
    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium text-zinc-400">Scale Range</label>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-xs text-zinc-500 mb-1">From</label>
                    <select
                        value={minValue}
                        onChange={(e) => onMinChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                        {[0, 1].map((val) => (
                            <option key={val} value={val} className="bg-zinc-900">
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="text-zinc-600 pt-5">to</div>
                <div className="flex-1">
                    <label className="block text-xs text-zinc-500 mb-1">To</label>
                    <select
                        value={maxValue}
                        onChange={(e) => onMaxChange(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                    >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                            <option key={val} value={val} className="bg-zinc-900">
                                {val}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="text-xs text-zinc-600 mt-2">
                Scale will range from {minValue} to {maxValue}
            </div>
        </div>
    );
};
