import React from 'react';
import { FileText, AlignLeft, ListOrdered, CheckSquare, ChevronDown, Upload, Calendar, Clock, Star, TrendingUp, Layout } from 'lucide-react';
import { FieldType } from '../../types';

interface QuestionTypeSelectorProps {
    currentType: FieldType;
    onTypeChange: (type: FieldType) => void;
}

const questionTypes = [
    { value: FieldType.SHORT_TEXT, label: 'Short Answer', icon: FileText, description: 'Single-line text' },
    { value: FieldType.LONG_TEXT, label: 'Paragraph', icon: AlignLeft, description: 'Multi-line text' },
    { value: FieldType.MULTIPLE_CHOICE, label: 'Multiple Choice', icon: ListOrdered, description: 'Single option' },
    { value: FieldType.CHECKBOX, label: 'Checkboxes', icon: CheckSquare, description: 'Multiple options' },
    { value: FieldType.DROPDOWN, label: 'Dropdown', icon: ChevronDown, description: 'Select menu' },
    { value: FieldType.FILE_UPLOAD, label: 'File Upload', icon: Upload, description: 'Upload files' },
    { value: FieldType.DATE, label: 'Date', icon: Calendar, description: 'Date picker' },
    { value: FieldType.TIME, label: 'Time', icon: Clock, description: 'Time picker' },
    { value: FieldType.RATING, label: 'Rating', icon: Star, description: 'Star rating' },
    { value: FieldType.LINEAR_SCALE, label: 'Linear Scale', icon: TrendingUp, description: '1-5, 1-10' },
    { value: FieldType.SECTION, label: 'Section', icon: Layout, description: 'Visual separator' },
];

import { createPortal } from 'react-dom';

export const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({ currentType, onTypeChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [dropdownStyle, setDropdownStyle] = React.useState({});
    const currentTypeInfo = questionTypes.find(t => t.value === currentType);

    React.useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                top: `${rect.bottom + window.scrollY + 8}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
            });
        }
    }, [isOpen]);

    const dropdown = (
        <>
            <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />
            <div
                className="absolute z-50 p-2 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-96 overflow-y-auto"
                style={dropdownStyle}
            >
                {questionTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = type.value === currentType;
                    return (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => {
                                onTypeChange(type.value);
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all ${isSelected
                                ? 'bg-white/10 border border-white/20'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-zinc-400'}`} />
                            <div className="flex-1">
                                <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                    {type.label}
                                </div>
                                <div className="text-xs text-zinc-500">{type.description}</div>
                            </div>
                            {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-left flex items-center justify-between hover:bg-white/10 transition-all group"
            >
                <div className="flex items-center gap-3">
                    {currentTypeInfo && <currentTypeInfo.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />}
                    <div>
                        <div className="text-sm font-medium text-white">{currentTypeInfo?.label}</div>
                        <div className="text-xs text-zinc-500">{currentTypeInfo?.description}</div>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && createPortal(dropdown, document.body)}
        </div>
    );
};
