import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    // Fix: return Partial<State> instead of State
    public static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                    <h3 className="font-bold text-sm mb-1">Component Error</h3>
                    <p className="text-xs">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}