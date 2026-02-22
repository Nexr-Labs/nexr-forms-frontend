import React from 'react';

interface FileUploadConfigProps {
    fileTypes: string[];
    maxFileSize: number;
    onFileTypesChange: (types: string[]) => void;
    onMaxFileSizeChange: (size: number) => void;
}

const commonFileTypes = [
    { label: 'Images (jpg, png, gif)', value: 'jpg,png,gif' },
    { label: 'Documents (pdf, doc, docx)', value: 'pdf,doc,docx' },
    { label: 'Spreadsheets (xls, xlsx, csv)', value: 'xls,xlsx,csv' },
    { label: 'Any file type', value: '*' },
    { label: 'Custom...', value: 'custom' },
];

export const FileUploadConfig: React.FC<FileUploadConfigProps> = ({
    fileTypes,
    maxFileSize,
    onFileTypesChange,
    onMaxFileSizeChange,
}) => {
    const [isCustom, setIsCustom] = React.useState(false);
    const currentTypes = fileTypes?.join(',') || '*';

    const handleTypeChange = (value: string) => {
        if (value === 'custom') {
            setIsCustom(true);
        } else {
            setIsCustom(false);
            onFileTypesChange(value === '*' ? ['*'] : value.split(','));
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Allowed File Types</label>
                <select
                    value={isCustom ? 'custom' : currentTypes}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                    {commonFileTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-zinc-900">
                            {type.label}
                        </option>
                    ))}
                </select>
                {isCustom && (
                    <input
                        type="text"
                        placeholder="e.g., pdf,jpg,png"
                        value={currentTypes}
                        onChange={(e) => onFileTypesChange(e.target.value.split(',').map(t => t.trim()))}
                        className="w-full mt-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20"
                    />
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Max File Size</label>
                <select
                    value={maxFileSize}
                    onChange={(e) => onMaxFileSizeChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-white/20"
                >
                    <option value={1048576} className="bg-zinc-900">1 MB</option>
                    <option value={5242880} className="bg-zinc-900">5 MB</option>
                    <option value={10485760} className="bg-zinc-900">10 MB</option>
                    <option value={20971520} className="bg-zinc-900">20 MB</option>
                    <option value={52428800} className="bg-zinc-900">50 MB</option>
                </select>
            </div>
        </div>
    );
};
