import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

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
      errorInfo: errorInfo,
    });
    
    // Log error to monitoring service
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <FiAlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              An error occurred while rendering this page
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                <p className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap">
                  {this.state.error?.toString()}
                </p>
                <p className="text-red-500 dark:text-red-400 font-mono text-sm mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo?.componentStack}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
