import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

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

  handleReload = () => {
    window.location.reload();
  }

  handleHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="card-enhanced p-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                <FiAlertTriangle className="w-8 h-8 text-white" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReload}
                  className="btn-primary-enhanced flex items-center justify-center space-x-2"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>
                
                <button
                  onClick={this.handleHome}
                  className="btn-secondary-enhanced flex items-center justify-center space-x-2"
                >
                  <FiHome className="w-4 h-4" />
                  <span>Go Home</span>
                </button>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left">
                  <p className="text-red-600 dark:text-red-400 font-mono text-sm whitespace-pre-wrap">
                    {this.state.error?.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <p className="text-red-500 dark:text-red-400 font-mono text-sm mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
