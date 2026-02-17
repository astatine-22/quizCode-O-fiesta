import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackMessage?: string;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        // Call the onReset callback if provided
        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-container">
                        <div className="error-icon">⚠️</div>
                        <h1 className="error-title">Oops! Something went wrong</h1>
                        <p className="error-message">
                            {this.props.fallbackMessage ||
                                'An unexpected error occurred. Don\'t worry, your progress is safe!'}
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <pre className="error-stack">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <button
                            className="error-reset-button"
                            onClick={this.handleReset}
                        >
                            🏠 Return to Main Menu
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
