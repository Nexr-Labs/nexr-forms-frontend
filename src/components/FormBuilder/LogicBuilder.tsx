import React from 'react';
import { Share2 } from 'lucide-react';
import { ErrorBoundary } from '../ErrorBoundary';

interface Section {
    id: string;
    label: string;
    order: number;
}

interface LogicBuilderProps {
    options: string[];
    logic?: { [option: string]: string };
    sections: Section[];
    onChange: (logic: { [option: string]: string }) => void;
}

const LogicBuilderContent: React.FC<LogicBuilderProps> = ({
    options,
    logic,
    sections,
    onChange,
}) => {
    // Robust type checking - ensure we have valid arrays/objects
    const safeOptions = Array.isArray(options) ? options : [];
    const safeSections = Array.isArray(sections) ? sections : [];
    // Handle null logic explicitly (default param only works for undefined)
    const safeLogic = logic || {};

    const handleLogicChange = (option: string, destinationId: string) => {
        const newLogic = { ...safeLogic };
        if (destinationId === 'NEXT') {
            delete newLogic[option];
        } else {
            newLogic[option] = destinationId;
        }
        onChange(newLogic);
    };

    // Don't render if there are no valid options
    if (safeOptions.length === 0) {
        return null;
    }

    return (
        <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg border border-white/5">
            <div className="flex items-center gap-2 mb-4 text-zinc-300">
                <Share2 className="w-4 h-4" />
                <span className="text-sm font-medium">Logic Jump</span>
            </div>

            <div className="space-y-3">
                {safeOptions.map((option, idx) => (
                    <div key={`${option}-${idx}`} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
                            <span>If answer is "{option}"</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Go to</span>
                            <select
                                className="bg-black border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30 cursor-pointer"
                                value={safeLogic[option] || 'NEXT'}
                                onChange={(e) => handleLogicChange(option, e.target.value)}
                            >
                                <option value="NEXT">Next Section</option>
                                <option value="SUBMIT">Submit Form</option>
                                {safeSections.map(section => (
                                    <option key={section.id} value={section.id}>
                                        {section.order + 1}. {section.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const LogicBuilder = (props: LogicBuilderProps) => (
    <ErrorBoundary fallback={<div className="text-xs text-red-400 p-2">Logic Builder Error</div>}>
        <LogicBuilderContent {...props} />
    </ErrorBoundary>
);
