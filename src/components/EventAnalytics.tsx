import React from 'react';
import { EventData, Registration, FieldType } from '../types';
import { Download, PieChart, Users, FileText } from 'lucide-react';
import { Button, Card } from './UI';

interface EventAnalyticsProps {
    event: EventData;
    registrations: Registration[];
    loading: boolean;
}

export const EventAnalytics: React.FC<EventAnalyticsProps> = ({ event, registrations, loading }) => {
    // --- Data Aggregation Logic ---
    const getFieldStats = (fieldId: string) => {
        const counts: Record<string, number> = {};
        let totalAnswered = 0;

        registrations.forEach(reg => {
            const answer = reg.answers[fieldId];
            if (answer !== undefined && answer !== null && answer !== '') {
                totalAnswered++;
                if (Array.isArray(answer)) {
                    // Checkbox (multiple values)
                    answer.forEach(val => {
                        counts[val] = (counts[val] || 0) + 1;
                    });
                } else {
                    // Single value
                    counts[String(answer)] = (counts[String(answer)] || 0) + 1;
                }
            }
        });

        return { counts, totalAnswered };
    };

    const getChartData = (fieldId: string, options: string[]) => {
        const { counts, totalAnswered } = getFieldStats(fieldId);

        // For Linear Scale, options are numbers from min to max
        // For Choice, options are passed in
        return options.map(opt => ({
            label: opt,
            count: counts[opt] || 0,
            percentage: totalAnswered > 0 ? Math.round(((counts[opt] || 0) / totalAnswered) * 100) : 0
        }));
    };

    const downloadCSV = async () => {
        const token = localStorage.getItem('eventflow_token');
        // Use environment variable for API URL or fallback
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

        try {
            const response = await fetch(`${baseUrl}/events/${event.id}/export`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                console.error('Export failed:', await response.text());
                alert('Failed to download CSV');
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `event_${event.id}_responses.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export network error:', error);
            alert('Failed to initiate download');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    // Filter fields that are relevant for charts
    const chartFields = event.fields.filter(f =>
        [FieldType.MULTIPLE_CHOICE, FieldType.DROPDOWN, FieldType.CHECKBOX, FieldType.LINEAR_SCALE, FieldType.RATING].includes(f.type)
    );

    const textFields = event.fields.filter(f =>
        [FieldType.SHORT_TEXT, FieldType.LONG_TEXT, FieldType.DATE, FieldType.TIME, FieldType.FILE_UPLOAD].includes(f.type)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider">Total Responses</p>
                        <div className="text-4xl font-bold text-white mt-2">{registrations.length}</div>
                    </div>
                    <div className="bg-blue-500/10 p-4 rounded-full">
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg font-medium text-white mb-1">Export Data</h3>
                    <p className="text-zinc-500 text-sm mb-4">Download all responses as CSV</p>
                    <Button variant="primary" onClick={downloadCSV} icon={Download} className="w-full sm:w-auto">
                        Download CSV
                    </Button>
                </Card>
            </div>

            {registrations.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/30 border border-white/5 rounded-xl">
                    <PieChart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white font-medium">No responses yet</h3>
                    <p className="text-zinc-500 mt-2">Share your form to start collecting data.</p>
                </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-4">Response Analysis</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {chartFields.map((field) => {
                            let options: string[] = [];
                            if (field.type === FieldType.LINEAR_SCALE) {
                                for (let i = (field.minValue || 1); i <= (field.maxValue || 5); i++) options.push(String(i));
                            } else if (field.type === FieldType.RATING) {
                                for (let i = 1; i <= (field.maxValue || 5); i++) options.push(String(i));
                            } else {
                                options = field.options || [];
                            }

                            const data = getChartData(field.id, options);

                            return (
                                <Card key={field.id} className="p-6">
                                    <h3 className="text-lg font-semibold text-white mb-6">{field.label}</h3>
                                    <div className="space-y-4">
                                        {data.map((item) => (
                                            <div key={item.label} className="group">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-zinc-300 font-medium">{item.label}</span>
                                                    <span className="text-zinc-400">{item.count} ({item.percentage}%)</span>
                                                </div>
                                                <div className="w-full bg-zinc-800/50 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out group-hover:bg-blue-400"
                                                        style={{ width: `${item.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500 text-right">
                                        {data.reduce((acc, curr) => acc + curr.count, 0)} responses
                                    </div>
                                </Card>
                            );
                        })}

                        {textFields.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-xl text-white font-bold mb-4">Text & Other Responses</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {textFields.map(field => {
                                        const { totalAnswered } = getFieldStats(field.id);
                                        return (
                                            <Card key={field.id} className="p-4 flex items-center gap-4">
                                                <div className="bg-zinc-800 p-3 rounded-lg">
                                                    <FileText className="w-5 h-5 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-white">{field.label}</div>
                                                    <div className="text-xs text-zinc-500">{totalAnswered} responses</div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
