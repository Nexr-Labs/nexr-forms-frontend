import React from 'react';
import { Plus, GripVertical, X } from 'lucide-react';

interface OptionManagerProps {
    options: string[];
    onChange: (options: string[]) => void;
}

export const OptionManager: React.FC<OptionManagerProps> = ({ options, onChange }) => {
    const addOption = () => {
        onChange([...options, `Option ${options.length + 1}`]);
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        onChange(newOptions);
    };

    const removeOption = (index: number) => {
        if (options.length <= 1) return; // Keep at least one option
        onChange(options.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-zinc-400 mb-2">Options</label>
            {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 group">
                    <GripVertical className="w-4 h-4 text-zinc-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                        placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addOption}
                className="w-full px-3 py-2 border-2 border-dashed border-zinc-700 rounded-lg text-sm text-zinc-500 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Option
            </button>
        </div>
    );
};
