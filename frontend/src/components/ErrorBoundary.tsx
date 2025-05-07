import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 border border-red-200 rounded bg-red-50">
                    <h2 className="text-lg font-bold text-red-800">Error al cargar componente</h2>
                    <p className="text-red-600">{this.state.error?.message}</p>
                    <button
                        className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => window.location.reload()}
                    >
                        Recargar
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}