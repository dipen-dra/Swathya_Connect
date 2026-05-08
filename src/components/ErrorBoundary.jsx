import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // In a production app, log this error to an error reporting service like Sentry
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                            <p className="text-gray-600 text-sm">
                                We're sorry, but an unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                            </p>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-gray-100 p-4 rounded-lg text-left overflow-auto max-h-48 text-xs text-gray-800 font-mono">
                                <p className="font-bold text-red-600">{this.state.error.toString()}</p>
                                <p className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</p>
                            </div>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
